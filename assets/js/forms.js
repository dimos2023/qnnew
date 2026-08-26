/* LEGACY MOTORS — form handling.
   Concierge enquiries and interest registrations. When Firebase is wired in
   (window.LEGACY_FB), submissions are written to Firestore; until then the form
   validates and confirms gracefully so the experience is complete end-to-end. */
(() => {
  'use strict';

  const t = (en, ar) =>
    (document.documentElement.lang === 'ar' ? ar : en);

  function alertBox(form) {
    return form.parentElement.querySelector('.form-alert') ||
           form.querySelector('.form-alert');
  }

  function show(box, kind, msg) {
    if (!box) return;
    box.className = 'form-alert show ' + kind;
    box.textContent = msg;
  }

  // Enquiries are emailed via FormSubmit (no backend needed). The first
  // submission sends a one-time activation email to this address — click the
  // link once and every later enquiry arrives in the inbox.
  const FORM_EMAIL = 'info@qnautomotive.com';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + encodeURIComponent(FORM_EMAIL);

  async function submit(form, subject) {
    const box = alertBox(form);
    const data = Object.fromEntries(new FormData(form).entries());

    // Minimal validation
    if (!data.name || !data.name.trim()) {
      return show(box, 'err', t('Please enter your name.', 'من فضلك أدخل اسمك.'));
    }
    if (data.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) {
      return show(box, 'err', t('Please enter a valid email.', 'من فضلك أدخل بريدا إلكترونيا صحيحا.'));
    }

    const btn = form.querySelector('button[type=submit]');
    if (btn) btn.disabled = true;

    try {
      const payload = Object.assign({}, data, {
        _subject: subject,
        _template: 'table',
        _captcha: 'false'
      });
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false || json.success === 'false') throw new Error('failed');
      form.reset();
      show(box, 'ok',
        t('Received. Our concierge team will be in touch shortly.',
          'تم الاستلام. سيتواصل معك فريق الكونسيرج قريبا.'));
    } catch (e) {
      show(box, 'err',
        t('Something went wrong. Please try again or contact us on WhatsApp.',
          'حدث خطأ ما. حاول مرة أخرى أو تواصل معنا على واتساب.'));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  const concierge = document.getElementById('concierge-form');
  if (concierge) {
    concierge.addEventListener('submit', (e) => {
      e.preventDefault();
      submit(concierge, 'New concierge enquiry — QN Automotive');
    });
  }

  const join = document.getElementById('join-form');
  if (join) {
    join.addEventListener('submit', (e) => {
      e.preventDefault();
      submit(join, 'New interest registration — QN Automotive');
    });
  }

  const testdrive = document.getElementById('testdrive-form');
  if (testdrive) {
    testdrive.addEventListener('submit', (e) => {
      e.preventDefault();
      submit(testdrive, 'New test-drive request — QN Automotive');
    });
  }

  // Placeholder translations for [data-i18n-ph] (input/textarea placeholders).
  function applyPlaceholders() {
    const ar = document.documentElement.lang === 'ar';
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      const key = el.getAttribute('data-i18n-ph');
      // The dictionary lives in i18n.js; reuse it via a tiny lookup if present.
      if (window.LegacyI18n && window.LegacyI18n.ph) {
        const v = window.LegacyI18n.ph(key, ar ? 'ar' : 'en');
        if (v) el.placeholder = v;
      }
    });
  }
  window.addEventListener('legacy:langchange', applyPlaceholders);
})();
