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

  async function submit(form, collection, buildDoc) {
    const box = alertBox(form);
    const data = Object.fromEntries(new FormData(form).entries());

    // Minimal validation
    if (!data.name || !data.name.trim()) {
      return show(box, 'err', t('Please enter your name.', 'من فضلك أدخل اسمك.'));
    }
    if (data.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) {
      return show(box, 'err', t('Please enter a valid email.', 'من فضلك أدخل بريداً إلكترونياً صحيحاً.'));
    }

    const btn = form.querySelector('button[type=submit]');
    if (btn) btn.disabled = true;

    try {
      if (window.LEGACY_FB && window.LEGACY_FB.addDoc) {
        await window.LEGACY_FB.addDoc(collection, buildDoc(data));
      } else {
        // Firebase not wired yet — simulate a brief network round-trip.
        await new Promise((r) => setTimeout(r, 500));
      }
      form.reset();
      show(box, 'ok',
        t('Received. Our concierge team will be in touch shortly.',
          'تم الاستلام. سيتواصل معك فريق الكونسيرج قريباً.'));
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
      submit(concierge, 'contact_inquiries', (d) => ({
        fullName: d.name, email: (d.email || '').toLowerCase(), phone: d.phone || '',
        model: d.model || '', message: d.message || '', source: 'legacy-site',
        status: 'new', createdAt: Date.now(),
      }));
    });
  }

  const join = document.getElementById('join-form');
  if (join) {
    join.addEventListener('submit', (e) => {
      e.preventDefault();
      submit(join, 'registration_requests', (d) => ({
        name: d.name, email: (d.email || '').toLowerCase(), phone: d.phone || '',
        company: d.company || '', model: d.model || '', city: d.city || '',
        status: 'pending', source: 'legacy-site', submittedAt: Date.now(),
      }));
    });
  }

  const testdrive = document.getElementById('testdrive-form');
  if (testdrive) {
    testdrive.addEventListener('submit', (e) => {
      e.preventDefault();
      submit(testdrive, 'test_drive_requests', (d) => ({
        name: d.name, email: (d.email || '').toLowerCase(), phone: d.phone || '',
        model: d.model || '', city: d.city || '', preferredDate: d.date || '',
        status: 'new', source: 'legacy-site', createdAt: Date.now(),
      }));
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
