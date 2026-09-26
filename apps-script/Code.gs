/**
 * QN AUTOMOTIVE — enquiry + registration backend (Google Apps Script).
 *
 * One web app behind every form on the site:
 *   POST  (from the site)            → appends the submission as a row
 *   GET  ?check=<email>              → public {exists:true|false} duplicate check
 *   GET  ?action=leads&token=<pass>  → every row, for the admin dashboard
 *   GET  ?action=status&token=<pass>&row=<n>&status=approved|rejected|pending
 *
 * Columns are created from the field names the site sends, so adding a field
 * to the form needs no change here — a new header appears at the end.
 *
 * Deploy:  Deploy → New deployment → Web app
 *          Execute as: Me · Who has access: Anyone
 *          then paste the /exec URL into assets/js/registration.js,
 *          assets/js/config.js and admin.html (they all use the same one).
 */

/* The admin dashboard passcode — set it to the one you already use. */
var ADMIN_PASS = 'CHANGE-ME';

/* Sheet that stores the submissions (created on first write if missing). */
var SHEET_NAME = 'Leads';

/* Fields the site sends that are stored under a friendlier header. */
var RENAME = { '_form': 'Form', '_page': 'Page', '_subject': null };

/* An application is "open" — and therefore blocks a second one — while it is
   pending or approved. A rejected applicant may apply again. */
var OPEN_STATUSES = ['pending', 'approved'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(['Time']);
  return sh;
}

function headers_(sh) {
  return sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0];
}

/* Header matching ignores case, spaces, dashes and underscores, so "Job title",
   "jobTitle" and "job_title" are one column. */
function key_(s) { return String(s).toLowerCase().replace(/[\s_-]/g, ''); }

function colIndex_(headers, name) {
  var want = key_(name);
  for (var i = 0; i < headers.length; i++) {
    if (key_(headers[i]) === want) return i;
  }
  return -1;
}

/* ---- write ------------------------------------------------------------- */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = sheet_();
    var headers = headers_(sh);
    var params = (e && e.parameter) || {};
    var values = {};

    Object.keys(params).forEach(function (k) {
      var name = RENAME.hasOwnProperty(k) ? RENAME[k] : k;
      if (!name) return;                       // dropped (e.g. _subject)
      values[name] = params[k];
    });
    values.Time = new Date();
    if (!values.status && /registration/i.test(String(values.Form || ''))) values.status = 'pending';

    /* Any field we have never seen becomes a new column at the end. */
    Object.keys(values).forEach(function (name) {
      if (colIndex_(headers, name) === -1) {
        headers.push(name);
        sh.getRange(1, headers.length).setValue(name);
      }
    });

    var row = headers.map(function (h) {
      var name = Object.keys(values).filter(function (n) { return key_(n) === key_(h); })[0];
      return name ? values[name] : '';
    });
    sh.appendRow(row);

    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } finally {
    lock.releaseLock();
  }
}

/* ---- read -------------------------------------------------------------- */

function rows_() {
  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var headers = headers_(sh);
  var data = sh.getRange(2, 1, last - 1, headers.length).getValues();
  return data.map(function (r, i) {
    var o = { Row: i + 2 };                    // sheet row, so the admin can update it
    headers.forEach(function (h, c) { if (h) o[h] = r[c]; });
    return o;
  });
}

function reply_(e, obj) {
  var cb = e && e.parameter && e.parameter.callback;
  var json = JSON.stringify(obj);
  if (cb) {
    return ContentService.createTextOutput(cb + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var p = (e && e.parameter) || {};

  /* Public: does this email already hold an open application?
     Answers a bare true/false — no stored data is ever returned here. */
  if (p.check) {
    var email = String(p.check).trim().toLowerCase();
    var exists = rows_().some(function (r) {
      var o = {};
      Object.keys(r).forEach(function (k) { o[key_(k)] = r[k]; });
      if (String(o.email || '').trim().toLowerCase() !== email) return false;
      if (!/registration/i.test(String(o.form || '')) && !o.jobtitle) return false;
      var st = String(o.status || 'pending').toLowerCase();
      return OPEN_STATUSES.indexOf(st) !== -1;
    });
    return reply_(e, { exists: exists });
  }

  /* Everything below needs the admin passcode. */
  if (String(p.token || '') !== ADMIN_PASS) return reply_(e, { error: 'unauthorised' });

  if (p.action === 'status') {
    var row = parseInt(p.row, 10);
    var status = String(p.status || '').toLowerCase();
    if (!row || row < 2) return reply_(e, { error: 'bad row' });
    if (['pending', 'approved', 'rejected'].indexOf(status) === -1) return reply_(e, { error: 'bad status' });

    var sh = sheet_();
    var headers = headers_(sh);
    var col = colIndex_(headers, 'status');
    if (col === -1) {
      headers.push('status');
      col = headers.length - 1;
      sh.getRange(1, headers.length).setValue('status');
    }
    sh.getRange(row, col + 1).setValue(status);
    return reply_(e, { ok: true, row: row, status: status });
  }

  /* Removing a row is how a test or a spam entry leaves the sheet without
     anyone opening it. It is permanent — the dashboard asks first. */
  if (p.action === 'delete') {
    var del = parseInt(p.row, 10);
    var sh2 = sheet_();
    if (!del || del < 2 || del > sh2.getLastRow()) return reply_(e, { error: 'bad row' });
    sh2.deleteRow(del);
    return reply_(e, { ok: true, deleted: del });
  }

  return reply_(e, { rows: rows_() });
}
