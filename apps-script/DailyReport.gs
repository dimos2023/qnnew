/**
 * QN AUTOMOTIVE — daily traffic report.
 *
 * Runs once a day on a time-driven trigger and does three things:
 *   1. reads yesterday's numbers from Google Analytics 4 (Analytics Data API)
 *   2. reads yesterday's requests from the same sheet the website posts to
 *   3. asks Claude to read both and write the analysis in Arabic
 * then sends the result by email, and to Telegram when it is configured.
 *
 * ── Setup ────────────────────────────────────────────────────────────────
 * 1. Editor → Services (+) → "Google Analytics Data API" → identifier
 *    AnalyticsData → Add.  (This also enables the API for the project.)
 * 2. Project Settings → Script Properties, add:
 *      GA4_PROPERTY_ID     the numeric property id — GA4 Admin → Property
 *                          Settings → "Property ID" (e.g. 412345678).
 *                          NOT the G-XXXXXXX measurement id.
 *      ANTHROPIC_API_KEY   from console.anthropic.com → API keys
 *      REPORT_EMAIL        where the report is sent (comma-separated for more)
 *      TELEGRAM_BOT_TOKEN  optional — from @BotFather
 *      TELEGRAM_CHAT_ID    optional — your chat id (ask @userinfobot)
 * 3. Run testReport() once and approve the permissions it asks for.
 * 4. Run createDailyTrigger() once to schedule it every morning.
 *
 * Nothing here is hardcoded: every key lives in Script Properties, so this
 * file stays safe to keep in the public repository.
 */

var REPORT_HOUR = 8;            // local time the report is sent
var CLAUDE_MODEL = 'claude-opus-5-5';
/* Apps Script drops a UrlFetchApp call that takes too long, so the analysis
   runs at low effort: it is a short daily summary, not a research task. */
var CLAUDE_EFFORT = 'low';

function prop_(name) {
  return (PropertiesService.getScriptProperties().getProperty(name) || '').trim();
}

/* ---- dates -------------------------------------------------------------- */

function tz_() { return Session.getScriptTimeZone() || 'Africa/Cairo'; }

function daysAgo_(n) {
  var d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function ymd_(date) { return Utilities.formatDate(date, tz_(), 'yyyy-MM-dd'); }

/* ---- Google Analytics --------------------------------------------------- */

function runReport_(propertyId, body) {
  var res = AnalyticsData.Properties.runReport(body, 'properties/' + propertyId);
  return (res && res.rows) || [];
}

function firstRowMetrics_(rows, names) {
  var out = {};
  names.forEach(function (n, i) {
    out[n] = rows.length ? Number(rows[0].metricValues[i].value) : 0;
  });
  return out;
}

function breakdown_(rows, limit) {
  return rows.slice(0, limit || 6).map(function (r) {
    return { name: r.dimensionValues[0].value, value: Number(r.metricValues[0].value) };
  });
}

/* Yesterday's traffic, the day before it for comparison, and the breakdowns
   worth reading over coffee: where people came from, what they opened, which
  country they were in, and what they were holding. */
function gaStats_(propertyId) {
  var yesterday = ymd_(daysAgo_(1));
  var before = ymd_(daysAgo_(2));
  var metrics = ['activeUsers', 'newUsers', 'sessions', 'screenPageViews', 'averageSessionDuration', 'engagementRate'];
  var metricSpec = metrics.map(function (m) { return { name: m }; });

  var totals = function (date) {
    return firstRowMetrics_(runReport_(propertyId, {
      dateRanges: [{ startDate: date, endDate: date }],
      metrics: metricSpec
    }), metrics);
  };

  var byDimension = function (dimension, metric, limit) {
    return breakdown_(runReport_(propertyId, {
      dateRanges: [{ startDate: yesterday, endDate: yesterday }],
      dimensions: [{ name: dimension }],
      metrics: [{ name: metric }],
      orderBys: [{ metric: { metricName: metric }, desc: true }],
      limit: limit || 10
    }), limit);
  };

  return {
    date: yesterday,
    yesterday: totals(yesterday),
    dayBefore: totals(before),
    channels: byDimension('sessionDefaultChannelGroup', 'sessions', 6),
    pages: byDimension('pagePath', 'screenPageViews', 6),
    countries: byDimension('country', 'activeUsers', 5),
    devices: byDimension('deviceCategory', 'sessions', 3)
  };
}

/* ---- the site's own requests ------------------------------------------- */

/* Counts yesterday's rows from the Leads sheet by the form that produced
   them, so the report pairs traffic with what the traffic actually did. */
function siteStats_() {
  var rows;
  try { rows = rows_(); } catch (e) { return null; }   // rows_() lives in Code.gs
  var day = ymd_(daysAgo_(1));
  var out = { date: day, total: 0, byForm: {}, pending: 0, people: [] };

  rows.forEach(function (r) {
    var o = {};
    Object.keys(r).forEach(function (k) { o[key_(k)] = r[k]; });
    var when = o.time ? new Date(o.time) : null;
    if (!when || isNaN(when.getTime()) || ymd_(when) !== day) return;

    var form = String(o.form || 'Other');
    out.total++;
    out.byForm[form] = (out.byForm[form] || 0) + 1;
    if (String(o.status || 'pending').toLowerCase() === 'pending') out.pending++;
    out.people.push({
      name: o.name || o.company || '',
      model: o.desiredmodel || o.model || '',
      form: form
    });
  });
  return out;
}

/* ---- Claude ------------------------------------------------------------- */

var SYSTEM_PROMPT =
  'أنت محلل أداء مواقع تكتب لمالك معرض سيارات فاخرة في مصر (QN Automotive). ' +
  'تكتب بالعربية المصرية الواضحة، بدون مبالغة وبدون مصطلحات إنجليزية إلا أسماء الصفحات والمصادر. ' +
  'تقريرك اليومي من أربعة أجزاء قصيرة بالترتيب: ' +
  '1) سطر واحد يلخص اليوم. ' +
  '2) "الأرقام" — أهم 4 أرقام مع نسبة التغير عن اليوم اللي قبله. ' +
  '3) "اللي يستاهل انتباه" — من فضلك اربط بين الزيارات والطلبات (نسبة التحويل)، واذكر أي مصدر أو صفحة غير طبيعية. ' +
  'لو الأرقام صغيرة أو التغير ممكن يكون صدفة، قول كده صراحة بدل ما تخترع سبب. ' +
  '4) "اعمل إيه النهاردة" — توصيتين أو ثلاثة فقط، كل واحدة قابلة للتنفيذ في نفس اليوم. ' +
  'ممنوع تخترع أرقام مش موجودة في البيانات. الرد نص عادي بدون Markdown وبدون جداول، ' +
  'لأنه هيتبعت في رسالة.';

function askClaude_(payload) {
  var key = prop_('ANTHROPIC_API_KEY');
  if (!key) return null;

  var res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: CLAUDE_MODEL,
      /* Thinking tokens count against max_tokens, so this is well above the
         length of the report itself — a tight cap truncates the answer away. */
      max_tokens: 8000,
      output_config: { effort: CLAUDE_EFFORT },
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: 'دي بيانات موقع qnautomotive.com عن يوم ' + payload.date + '.\n\n' +
                 'أرقام Google Analytics والطلبات اللي وصلت من الموقع:\n' +
                 JSON.stringify(payload, null, 1) +
                 '\n\nاكتب تقرير اليوم.'
      }]
    })
  });

  var code = res.getResponseCode();
  var body = JSON.parse(res.getContentText() || '{}');
  if (code !== 200) {
    return 'تعذر تشغيل التحليل (' + code + '): ' + ((body.error && body.error.message) || '') ;
  }
  /* A refusal comes back as HTTP 200 with no usable text. */
  if (body.stop_reason === 'refusal') return 'تعذر تشغيل التحليل: الطلب اترفض.';

  var text = (body.content || [])
    .filter(function (b) { return b.type === 'text'; })
    .map(function (b) { return b.text; })
    .join('\n')
    .trim();

  if (!text) {
    return body.stop_reason === 'max_tokens'
      ? 'التحليل اتقطع قبل ما يخلص. جرب ترفع max_tokens في DailyReport.gs.'
      : 'التحليل رجع فاضي.';
  }
  return text;
}

/* ---- the report --------------------------------------------------------- */

function pct_(now, before) {
  if (!before) return now ? '+جديد' : '0%';
  var change = Math.round(((now - before) / before) * 100);
  return (change > 0 ? '+' : '') + change + '%';
}

function numbersBlock_(ga) {
  if (!ga) return 'Google Analytics: غير مربوط بعد.';
  var y = ga.yesterday, b = ga.dayBefore;
  var line = function (label, key, suffix) {
    return label + ': ' + Math.round(y[key]) + (suffix || '') + '  (' + pct_(y[key], b[key]) + ')';
  };
  return [
    line('الزوار', 'activeUsers'),
    line('زوار جدد', 'newUsers'),
    line('الجلسات', 'sessions'),
    line('مشاهدات الصفحات', 'screenPageViews'),
    'متوسط مدة الجلسة: ' + Math.round(y.averageSessionDuration) + ' ثانية  (' + pct_(y.averageSessionDuration, b.averageSessionDuration) + ')',
    'نسبة التفاعل: ' + Math.round(y.engagementRate * 100) + '%'
  ].join('\n');
}

function listBlock_(title, items, unit) {
  if (!items || !items.length) return '';
  return title + '\n' + items.map(function (i) {
    return '  · ' + i.name + ' — ' + i.value + (unit || '');
  }).join('\n');
}

function buildReport_() {
  var propertyId = prop_('GA4_PROPERTY_ID');
  var ga = null;
  var gaError = '';
  if (propertyId) {
    try { ga = gaStats_(propertyId); } catch (e) { gaError = String(e); }
  }
  var site = siteStats_();
  var date = (ga && ga.date) || (site && site.date) || ymd_(daysAgo_(1));

  var analysis = askClaude_({ date: date, analytics: ga, requests: site }) ||
    'التحليل مش مفعّل (مفتاح Anthropic مش مضاف في Script Properties).';

  var requestsBlock = !site
    ? 'الطلبات: تعذر قراءة الشيت.'
    : ['الطلبات: ' + site.total + ' (' + site.pending + ' في انتظار الموافقة)']
        .concat(Object.keys(site.byForm).map(function (f) { return '  · ' + f + ' — ' + site.byForm[f]; }))
        .join('\n');

  var text = [
    'تقرير QN Automotive — ' + date,
    '',
    analysis,
    '',
    '— — —',
    numbersBlock_(ga),
    '',
    requestsBlock,
    '',
    ga ? listBlock_('مصادر الزيارات:', ga.channels, ' جلسة') : '',
    ga ? listBlock_('أكثر الصفحات:', ga.pages, ' مشاهدة') : '',
    ga ? listBlock_('الدول:', ga.countries, ' زائر') : '',
    ga ? listBlock_('الأجهزة:', ga.devices, ' جلسة') : '',
    gaError ? '\nتعذر قراءة Google Analytics: ' + gaError : ''
  ].filter(String).join('\n');

  return { date: date, text: text };
}

/* ---- delivery ----------------------------------------------------------- */

function sendEmail_(subject, text) {
  var to = prop_('REPORT_EMAIL');
  if (!to) return;
  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: text,
    htmlBody: '<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;' +
      'line-height:1.9;color:#1a1a1e;max-width:640px">' +
      '<div style="border-bottom:2px solid #b7935a;padding-bottom:10px;margin-bottom:18px;' +
      'font-weight:bold;font-size:17px">QN AUTOMOTIVE</div>' +
      text.split('\n').map(function (l) {
        return l.trim() === '— — —'
          ? '<hr style="border:0;border-top:1px solid #ddd;margin:18px 0">'
          : '<div>' + l.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>';
      }).join('') +
      '</div>'
  });
}

function sendTelegram_(text) {
  var token = prop_('TELEGRAM_BOT_TOKEN'), chat = prop_('TELEGRAM_CHAT_ID');
  if (!token || !chat) return;
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    muteHttpExceptions: true,
    payload: { chat_id: chat, text: text.slice(0, 4000), disable_web_page_preview: 'true' }
  });
}

/* WhatsApp goes here when the business account is ready: one call to the
   provider, same text. Nothing else in this file changes. */
function sendWhatsApp_(text) {
  var token = prop_('WHATSAPP_TOKEN'), phoneId = prop_('WHATSAPP_PHONE_ID'), to = prop_('WHATSAPP_TO');
  if (!token || !phoneId || !to) return;
  UrlFetchApp.fetch('https://graph.facebook.com/v21.0/' + phoneId + '/messages', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text.slice(0, 4000) }
    })
  });
}

/* ---- entry points ------------------------------------------------------- */

function sendDailyReport() {
  var report = buildReport_();
  var subject = 'تقرير QN Automotive — ' + report.date;
  sendEmail_(subject, report.text);
  sendTelegram_(subject + '\n\n' + report.text);
  sendWhatsApp_(subject + '\n\n' + report.text);
  return report.text;
}

/** Run once by hand: builds and sends today's report, and logs it. */
function testReport() {
  var text = sendDailyReport();
  Logger.log(text);
  return text;
}

/** Run once: schedules the report every morning. Safe to re-run. */
function createDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendDailyReport') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendDailyReport').timeBased().atHour(REPORT_HOUR).everyDays(1).create();
  Logger.log('Daily report scheduled at ' + REPORT_HOUR + ':00 ' + tz_());
}

/** Prints what is configured and what is still missing. */
function showConfig() {
  ['GA4_PROPERTY_ID', 'ANTHROPIC_API_KEY', 'REPORT_EMAIL', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']
    .forEach(function (k) {
      var v = prop_(k);
      Logger.log(k + ': ' + (v ? (k.indexOf('KEY') !== -1 || k.indexOf('TOKEN') !== -1 ? 'set' : v) : '— missing —'));
    });
}
