/* QN AUTOMOTIVE — form handling.
   Every enquiry is posted to a Google Sheet (via an Apps Script web app) and,
   optionally, emailed. On success the form is replaced by a confirmation that
   the request was received and the team will be in touch right away. */
(() => {
  'use strict';

  /* ── Where submissions go ───────────────────────────────────────────────
     1) GOOGLE SHEET — paste your Apps Script Web App URL between the quotes.
        (Deploy → New deployment → Web app → Execute as: Me, Access: Anyone.)
        It looks like: https://script.google.com/macros/s/AKfycb.../exec        */
  const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbz00TPSN7ooyEvdLjltVJv9SRkJrsjmfM31_iwtae09aiCfZTxW1mF2NlEC9IbfFTDkEg/exec';
  /*   2) EMAIL COPY (optional) via FormSubmit — needs a one-time activation.   */
  const FORM_EMAIL = 'info@qnautomotive.com';
  const EMAIL_ENDPOINT = 'https://formsubmit.co/ajax/' + encodeURIComponent(FORM_EMAIL);

  const t = (en, ar) => (document.documentElement.lang === 'ar' ? ar : en);

  function alertBox(form) {
    return form.parentElement.querySelector('.form-alert') || form.querySelector('.form-alert');
  }
  function show(box, kind, msg) {
    if (!box) return;
    box.className = 'form-alert show ' + kind;
    box.textContent = msg;
  }

  function successPanel() {
    const wrap = document.createElement('div');
    wrap.className = 'form-success';
    wrap.setAttribute('role', 'status');
    wrap.innerHTML =
      '<div class="fs-ic" aria-hidden="true">✓</div>' +
      '<h3>' + t('Your request has been received', 'تم استقبال طلبك') + '</h3>' +
      '<p>' + t('Thank you. Our specialist team will contact you right away.',
                'شكرًا لك. سيتواصل معك الفريق المختص فورًا.') + '</p>';
    return wrap;
  }

  // no-cors + form-encoded avoids the CORS preflight an Apps Script can't answer.
  async function sendToSheet(payload) {
    if (!SHEET_ENDPOINT) return;
    await fetch(SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(payload) });
  }
  async function sendEmail(payload) {
    try {
      await fetch(EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.assign({}, payload, { _template: 'table', _captcha: 'false' }))
      });
    } catch (e) { /* email is best-effort — the sheet is the source of truth */ }
  }

  async function submit(form, subject) {
    const box = alertBox(form);
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.name || !data.name.trim())
      return show(box, 'err', t('Please enter your name.', 'من فضلك أدخل اسمك.'));
    if (data.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || ''))
      return show(box, 'err', t('Please enter a valid email.', 'من فضلك أدخل بريدًا إلكترونيًا صحيحًا.'));

    const btn = form.querySelector('button[type=submit]');
    if (btn) { btn.disabled = true; btn.dataset.busy = '1'; }

    const payload = Object.assign({}, data, {
      _subject: subject,
      _form: subject,
      _page: location.pathname
    });

    try {
      await Promise.all([sendToSheet(payload), sendEmail(payload)]);
      form.reset();
      const panel = successPanel();
      form.after(panel);
      form.hidden = true;
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {
      if (btn) { btn.disabled = false; delete btn.dataset.busy; }
      show(box, 'err', t('Something went wrong. Please try again or contact us on WhatsApp.',
                         'حدث خطأ ما. حاول مرة أخرى أو تواصل معنا على واتساب.'));
    }
  }

  function wire(id, subject) {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', (e) => { e.preventDefault(); submit(form, subject); });
  }
  wire('concierge-form', 'New concierge enquiry — QN Automotive');
  wire('join-form', 'New interest registration — QN Automotive');
  wire('testdrive-form', 'New test-drive request — QN Automotive');

  // Placeholder translations for [data-i18n-ph] (input/textarea placeholders).
  function applyPlaceholders() {
    const ar = document.documentElement.lang === 'ar';
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      const key = el.getAttribute('data-i18n-ph');
      if (window.LegacyI18n && window.LegacyI18n.ph) {
        const v = window.LegacyI18n.ph(key, ar ? 'ar' : 'en');
        if (v) el.placeholder = v;
      }
    });
  }
  window.addEventListener('legacy:langchange', applyPlaceholders);
})();
