/* QN AUTOMOTIVE — registration application form.
   One builder shared by every enquiry form on the site (Register interest,
   Concierge, Test drive) so a visitor always fills in the same application.
   There is no password and no account: the form posts a request that lands in
   the admin dashboard as "pending" until the team approves it.

   The markup is built here rather than repeated in three pages — same reason
   the configurator builds its quotation modal in JS: one form, one place to
   change it. Each page only carries an empty <form data-registration="…">. */
(function () {
  'use strict';

  /* Same Google Sheet endpoint the rest of the site posts to. */
  var SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycby4P7oZLtUMhHeVkLHki14FjOcw9gN_-yZHWLqx6ZTq26WoOkiIdHiWusmjkhXURbzO/exec';
  var FORM_EMAIL = 'info@qnautomotive.com';
  var EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/' + encodeURIComponent(FORM_EMAIL);
  var STORE_KEY = 'qmRegistration';
  var HOME_DELAY = 3200;

  var VEHICLE_TYPES = [
    { v: 'Sedan', ar: 'سيدان' },
    { v: 'SUV', ar: 'دفع رباعي SUV' },
    { v: 'Coupe / Hypercar', ar: 'كوبيه / هايبركار' },
    { v: 'Luxury MPV / Van', ar: 'ميني فان فاخرة' },
    { v: 'Fleet / Commercial', ar: 'أسطول / تجاري' }
  ];
  /* Ordered by how exclusive the marque is, Mercedes-Benz last and "Other"
     as the catch-all at the end. */
  var BRANDS = [
    { v: 'Porsche', ar: 'بورشه' },
    { v: 'Range Rover', ar: 'رينج روفر' },
    { v: 'Lexus', ar: 'لكزس' },
    { v: 'Audi', ar: 'أودي' },
    { v: 'BMW', ar: 'بي إم دبليو' },
    { v: 'Mercedes-Benz', ar: 'مرسيدس-بنز' },
    { v: 'Other', ar: 'أخرى' }
  ];
  var MODELS = [
    { v: 'MAEXTRO S800', ar: 'MAEXTRO S800' },
    { v: 'YANGWANG U9', ar: 'YANGWANG U9' },
    { v: 'YANGWANG U8L', ar: 'YANGWANG U8L' }
  ];

  /* Each page keeps the one field that only makes sense there. */
  var SOURCES = {
    join: { label: 'Registration — Interest' },
    concierge: { label: 'Registration — Concierge', extra: 'message' },
    'test-drive': { label: 'Registration — Test drive', extra: 'date' },
    /* The Build & Price modal mounts the same form; the configuration it was
       built from travels with it (see opts.extra in mount). */
    quote: { label: 'Quote download — registration', submit: { en: 'Send my quotation', ar: 'أرسل لي عرض السعر' } }
  };

  function isAr() { return document.documentElement.lang === 'ar'; }
  function tr(en, ar) { return isAr() ? ar : en; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---- markup ----------------------------------------------------------- */

  function mark(required) {
    return required
      ? '<span class="reg-req" aria-hidden="true">*</span>'
      : '<span class="reg-opt">' + tr('(optional)', '(اختياري)') + '</span>';
  }
  function field(o) {
    return '<div class="field' + (o.full ? ' full' : '') + '">' +
        '<label for="' + o.id + '">' + esc(o.label) + ' ' + mark(o.required) + '</label>' +
        o.control +
        (o.hint ? '<p class="reg-hint">' + esc(o.hint) + '</p>' : '') +
      '</div>';
  }
  function input(id, name, type, ph, required, ltr) {
    return '<input id="' + id + '" name="' + name + '" type="' + type + '"' +
      (ph ? ' placeholder="' + esc(ph) + '"' : '') +
      (ltr ? ' dir="ltr"' : '') + (required ? ' required' : '') + '>';
  }
  function select(id, name, placeholder, list, required) {
    return '<select id="' + id + '" name="' + name + '"' + (required ? ' required' : '') + '>' +
      '<option value="" disabled selected>' + esc(placeholder) + '</option>' +
      list.map(function (o) {
        return '<option value="' + esc(o.v) + '">' + esc(isAr() ? o.ar : o.v) + '</option>';
      }).join('') +
    '</select>';
  }
  function section(n, title, inner, sub) {
    return '<section class="reg-sec">' +
        '<h3 class="reg-sec-h"><span class="reg-n">' + n + '</span>' + esc(title) + '</h3>' +
        (sub ? '<p class="reg-sec-sub">' + esc(sub) + '</p>' : '') +
        inner +
      '</section>';
  }

  function carRow(p) {
    return '<div class="reg-car">' +
        '<div class="field"><label class="sr-only">' + tr('Type', 'النوع') + '</label>' +
          select(p + '-ct-' + (++carSeq), 'car-type', tr('Select a type', 'اختر النوع'), VEHICLE_TYPES) + '</div>' +
        '<div class="field"><label class="sr-only">' + tr('Brand', 'الماركة') + '</label>' +
          select(p + '-cb-' + carSeq, 'car-brand', tr('Select a brand', 'اختر الماركة'), BRANDS) + '</div>' +
        '<button type="button" class="reg-car-x" aria-label="' + tr('Remove this car', 'حذف هذه السيارة') + '">&times;</button>' +
      '</div>';
  }
  var carSeq = 0;

  function build(form, src) {
    var p = form.id || 'reg';
    var extra = '';
    if (src.extra === 'message') {
      extra = field({
        id: p + '-message', label: tr('Message', 'رسالتك'), full: true,
        control: '<textarea id="' + p + '-message" name="message" placeholder="' +
          esc(tr('How can our concierge team help?', 'كيف يمكن لفريق الكونسيرج مساعدتك؟')) + '"></textarea>'
      });
    } else if (src.extra === 'date') {
      extra = field({
        id: p + '-date', label: tr('Preferred date', 'التاريخ المفضل'),
        control: input(p + '-date', 'date', 'date', '', false, true)
      });
    }

    form.innerHTML =
      '<p class="reg-legend"><span class="reg-req" aria-hidden="true">*</span> ' +
        tr('Required field', 'حقل مطلوب') + '</p>' +

      section(1, tr('Contact', 'بيانات التواصل'),
        '<div class="field-grid">' +
          field({
            id: p + '-email', label: tr('Email', 'البريد الإلكتروني'), required: true, full: true,
            control: input(p + '-email', 'email', 'email', 'name@yourcompany.com', true, true),
            hint: tr('We send your application status and your advisor’s reply to this address.',
                     'هنرسل على البريد ده حالة طلبك ورد مستشارك.')
          }) +
        '</div>') +

      section(2, tr('Company details', 'بيانات الشركة'),
        '<div class="field-grid">' +
          field({ id: p + '-phone', label: tr('Phone number', 'رقم الموبايل'), required: true,
            control: input(p + '-phone', 'phone', 'tel', '+971 50 000 0000', true, true) }) +
          field({ id: p + '-role', label: tr('Job title', 'المسمى الوظيفي'), required: true,
            control: input(p + '-role', 'role', 'text', tr('Procurement manager', 'مدير المشتريات'), true) }) +
          field({ id: p + '-company', label: tr('Company name', 'اسم الشركة'), required: true,
            control: input(p + '-company', 'company', 'text', '', true) }) +
          field({ id: p + '-linkedin', label: tr('LinkedIn profile URL', 'رابط حساب لينكدإن'), required: true,
            control: input(p + '-linkedin', 'linkedin_url', 'url', 'https://www.linkedin.com/in/your-profile', true, true) }) +
          field({ id: p + '-club', label: tr('Club name', 'اسم النادي'), required: true,
            control: input(p + '-club', 'club-name', 'text', tr('Membership club', 'نادي العضوية'), true) }) +
          field({ id: p + '-member', label: tr('Membership number', 'رقم العضوية'),
            control: input(p + '-member', 'membership-number', 'text', tr('e.g. 12345 (if any)', 'مثال: 12345 (إن وجد)')) }) +
          field({ id: p + '-address', label: tr('Detailed address', 'العنوان بالتفصيل'), required: true, full: true,
            control: '<textarea id="' + p + '-address" name="address" required placeholder="' +
              esc(tr('Building, street, city, country', 'المبنى، الشارع، المدينة، الدولة')) + '"></textarea>' }) +
        '</div>') +

      section(3, tr('Your vehicles', 'سياراتك الحالية'),
        '<div class="reg-cars one" data-cars>' + carRow(p) + '</div>' +
        '<button type="button" class="reg-add" data-add-car>+ ' + tr('Add another car', 'أضف سيارة أخرى') + '</button>',
        tr('List every car you currently own — tap "Add another car" for more.',
           'اذكر كل سيارة تمتلكها حالياً — اضغط "أضف سيارة أخرى" للمزيد.')) +

      section(4, tr('Your preferences', 'تفضيلاتك'),
        '<div class="field-grid">' +
          field({ id: p + '-model', label: tr('Desired QN Motors model', 'الموديل المطلوب من QN'), required: true,
            control: select(p + '-model', 'desired-model', tr('Select a model', 'اختر الموديل'), MODELS, true) }) +
          extra +
          field({ id: p + '-notes', label: tr('Notes for your advisor', 'ملاحظات لمستشارك'), full: true,
            control: '<textarea id="' + p + '-notes" name="notes"></textarea>' }) +
        '</div>') +

      '<p class="form-alert" role="alert"></p>' +
      '<p class="reg-foot">' +
        (src.foot
          ? tr(src.foot.en, src.foot.ar)
          : tr('Submit to send your application for review. You will see a confirmation and return to the homepage.',
               'اضغط إرسال لتقديم طلبك للمراجعة. ستظهر لك رسالة تأكيد ثم تعود للصفحة الرئيسية.')) +
      '</p>' +
      '<div class="form-actions">' +
        '<button type="submit" class="btn btn-chrome">' +
          (src.submit ? tr(src.submit.en, src.submit.ar) : tr('Register & continue', 'سجّل وتابع')) +
        '</button>' +
      '</div>';
  }

  /* ---- helpers ---------------------------------------------------------- */

  function alertBox(form) { return form.querySelector('.form-alert'); }
  function show(form, kind, msg) {
    var box = alertBox(form);
    if (!box) return;
    box.className = 'form-alert show ' + kind;
    box.textContent = msg;
  }
  function clearAlert(form) {
    var box = alertBox(form);
    if (box) { box.className = 'form-alert'; box.textContent = ''; }
  }
  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? (el.value || '').trim() : '';
  }
  function focusField(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (el && el.focus) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }
  function vehicles(form) {
    var out = [];
    form.querySelectorAll('.reg-car').forEach(function (row) {
      var type = row.querySelector('[name="car-type"]').value;
      var brand = row.querySelector('[name="car-brand"]').value;
      if (type && brand) out.push(type + ' — ' + brand);   /* em dash, per spec */
    });
    return out;
  }

  /* Duplicate guard. The Apps Script answers a plain {exists:true|false} for an
     email — nothing else is exposed — over JSONP, since the web app can't
     answer a CORS preflight. If the check itself fails we let the application
     through: the admin still sees both rows and can merge them. */
  function alreadyApplied(email) {
    return new Promise(function (resolve) {
      var cb = 'qnreg_' + Math.floor(Math.random() * 1e9);
      var s = document.createElement('script');
      var done = false;
      var timer = setTimeout(function () { finish(false); }, 8000);
      function finish(v) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        if (s.parentNode) s.remove();
        resolve(v);
      }
      window[cb] = function (data) { finish(!!(data && data.exists)); };
      s.onerror = function () { finish(false); };
      /* A deployment without the check endpoint answers with an empty body:
         the script loads but never calls back, so onload is the signal that
         this backend can't answer — no point making the applicant wait. */
      s.onload = function () { finish(false); };
      s.src = SHEET_ENDPOINT + '?check=' + encodeURIComponent(email) + '&callback=' + cb + '&_=' + Date.now();
      document.body.appendChild(s);
    });
  }

  function sendToSheet(payload) {
    return fetch(SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(payload) });
  }
  function sendEmail(payload) {
    return fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.assign({}, payload, { _template: 'table', _captcha: 'false' }))
    }).catch(function () { /* email is best-effort — the sheet is the record */ });
  }

  function successPanel(form) {
    var wrap = document.createElement('div');
    wrap.className = 'form-success';
    wrap.setAttribute('role', 'status');
    wrap.innerHTML =
      '<div class="fs-ic" aria-hidden="true">✓</div>' +
      '<h3>' + tr('Your registration is successful.', 'تم تسجيل طلبك بنجاح.') + '</h3>' +
      '<p>' + tr('Your profile is currently pending Admin Approval.',
                 'حسابك الآن في انتظار موافقة الإدارة.') + '</p>';
    form.after(wrap);
    form.hidden = true;
    wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () { location.href = '/'; }, HOME_DELAY);
  }

  /* ---- submit ----------------------------------------------------------- */

  function submit(form, src, opts) {
    opts = opts || {};
    var email = val(form, 'email').toLowerCase();

    /* 1 — email present and well formed */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      show(form, 'err', tr('Please enter a valid email.', 'من فضلك أدخل بريدًا إلكترونيًا صحيحًا.'));
      return focusField(form, 'email');
    }
    /* 2 — every required field filled */
    var required = [
      ['phone', tr('Please enter your phone number.', 'من فضلك أدخل رقم موبايلك.')],
      ['role', tr('Please enter your job title.', 'من فضلك أدخل مسماك الوظيفي.')],
      ['company', tr('Please enter your company name.', 'من فضلك أدخل اسم شركتك.')],
      ['linkedin_url', tr('Please enter your LinkedIn profile URL.', 'من فضلك أدخل رابط حسابك على لينكدإن.')],
      ['club-name', tr('Please enter your club name.', 'من فضلك أدخل اسم النادي.')],
      ['address', tr('Please enter your detailed address.', 'من فضلك أدخل عنوانك بالتفصيل.')],
      ['desired-model', tr('Please choose the model you are interested in.', 'من فضلك اختر الموديل المطلوب.')]
    ];
    for (var i = 0; i < required.length; i++) {
      if (!val(form, required[i][0])) {
        show(form, 'err', required[i][1]);
        return focusField(form, required[i][0]);
      }
    }
    /* 3 — at least one complete vehicle */
    var cars = vehicles(form);
    if (!cars.length) {
      show(form, 'err', tr('Please add at least one current vehicle (select both type and brand).',
                           'من فضلك أضف سيارة واحدة على الأقل (اختر النوع والماركة).'));
      return focusField(form, 'car-type');
    }

    clearAlert(form);
    var btn = form.querySelector('button[type=submit]');
    var label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.textContent = tr('Sending…', 'جارٍ الإرسال…'); }
    function release() {
      if (!btn) return;
      btn.disabled = false; btn.removeAttribute('aria-busy'); btn.textContent = label;
    }

    var emailLocal = email.split('@')[0];
    var record = {
      email: email,
      phone: val(form, 'phone'),
      jobTitle: val(form, 'role'),
      company: val(form, 'company'),
      linkedin_url: val(form, 'linkedin_url'),
      'club-name': val(form, 'club-name'),
      address: val(form, 'address'),
      'current-vehicles': cars,
      'desired-model': val(form, 'desired-model'),
      name: val(form, 'company') || val(form, 'role') || emailLocal,
      status: 'pending'
    };
    /* Optional fields only travel when the applicant filled them. */
    ['membership-number', 'notes'].forEach(function (k) {
      var v = val(form, k);
      if (v) record[k] = v;
    });
    if (src.extra) {
      var v = val(form, src.extra);
      if (v) record[src.extra] = v;
    }

    /* 4 — the same email may not hold two open applications */
    alreadyApplied(email).then(function (dupe) {
      if (dupe) {
        release();
        show(form, 'err', tr('This email already has a pending or approved application.',
                             'هذا البريد الإلكتروني له طلب معلّق أو مقبول بالفعل.'));
        return focusField(form, 'email');
      }

      /* The sheet only stores text, so the car list travels as one readable
         cell; the array itself is kept in localStorage for the next visit. */
      var payload = Object.assign({}, record, {
        'current-vehicles': cars.join(', '),
        model: record['desired-model'],
        _form: src.label,
        _subject: src.label + ' — QN Automotive',
        _page: location.pathname
      }, opts.extra ? opts.extra(record) : {});

      try { localStorage.setItem(STORE_KEY, JSON.stringify(record)); } catch (e) { /* private mode */ }

      return Promise.all([sendToSheet(payload), sendEmail(payload)]).then(function () {
        if (opts.onSuccess) opts.onSuccess(record, payload);
        else successPanel(form);
      });
    }).catch(function () {
      release();
      show(form, 'err', tr('Something went wrong. Please try again or contact us on WhatsApp.',
                           'حدث خطأ ما. حاول مرة أخرى أو تواصل معنا على واتساب.'));
    });
  }

  /* ---- wiring ----------------------------------------------------------- */

  function syncCarRows(form) {
    var wrap = form.querySelector('[data-cars]');
    if (wrap) wrap.classList.toggle('one', wrap.querySelectorAll('.reg-car').length < 2);
  }

  function wire(form, src, opts) {
    var p = form.id || 'reg';

    form.addEventListener('click', function (e) {
      if (e.target.closest('[data-add-car]')) {
        var wrap = form.querySelector('[data-cars]');
        wrap.insertAdjacentHTML('beforeend', carRow(p));
        syncCarRows(form);
        wrap.lastElementChild.querySelector('select').focus();
      }
      var x = e.target.closest('.reg-car-x');
      if (x) {
        var row = x.closest('.reg-car');
        if (form.querySelectorAll('.reg-car').length > 1) { row.remove(); syncCarRows(form); }
      }
    });

    /* A typo in the email is worth flagging before they reach the button, and
       the warning clears the moment they start fixing it. */
    form.addEventListener('blur', function (e) {
      if (e.target.name !== 'email') return;
      var v = (e.target.value || '').trim();
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        show(form, 'err', tr('Please enter a valid email.', 'من فضلك أدخل بريدًا إلكترونيًا صحيحًا.'));
      }
    }, true);
    form.addEventListener('input', function (e) {
      if (e.target.name === 'email') clearAlert(form);
    });

    form.addEventListener('submit', function (e) { e.preventDefault(); submit(form, src, opts); });
  }

  function render(form, src) {
    var keep = {};
    form.querySelectorAll('[name]').forEach(function (el) {
      if (el.name !== 'car-type' && el.name !== 'car-brand' && el.value) keep[el.name] = el.value;
    });
    var cars = [];
    form.querySelectorAll('.reg-car').forEach(function (row) {
      cars.push([row.querySelector('[name="car-type"]').value, row.querySelector('[name="car-brand"]').value]);
    });

    build(form, src);
    syncCarRows(form);

    Object.keys(keep).forEach(function (n) {
      var el = form.querySelector('[name="' + n + '"]');
      if (el) el.value = keep[n];
    });
    cars.forEach(function (pair, i) {
      if (i > 0) {
        form.querySelector('[data-cars]').insertAdjacentHTML('beforeend', carRow(form.id || 'reg'));
        syncCarRows(form);
      }
      var row = form.querySelectorAll('.reg-car')[i];
      row.querySelector('[name="car-type"]').value = pair[0];
      row.querySelector('[name="car-brand"]').value = pair[1];
    });
  }

  /* Build the form into an empty <form> and wire it up. Pages call this
     through init(); the Build & Price modal calls it directly and passes
     opts to attach the configuration and keep the receipt in the modal. */
  function mount(form, sourceKey, opts) {
    var src = SOURCES[sourceKey] || SOURCES.join;
    render(form, src);
    wire(form, src, opts);
    /* Rebuild in the new language, keeping whatever they typed. */
    window.addEventListener('legacy:langchange', function () {
      if (form.isConnected && !form.hidden) render(form, src);
    });
    return form;
  }

  window.QNRegistration = { mount: mount };

  function init() {
    var forms = document.querySelectorAll('form[data-registration]');
    if (!forms.length) return;
    forms.forEach(function (form) {
      mount(form, form.getAttribute('data-registration'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
