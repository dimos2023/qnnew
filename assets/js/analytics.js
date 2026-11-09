/* Measurement for QN Automotive: Google Analytics 4 and the Meta pixel.
   Both ids sit at the top. An id left blank switches that one off entirely —
   no external calls, no errors — so the file is safe to ship either way.

   The site also reports its own conversions through window.QNTrack (bottom of
   this file): one call from the forms reaches both platforms, so "a visitor
   became a request" is countable in Analytics and usable for Meta ads. */
(function () {
  var GA_ID = 'G-GQD8V39HTZ';          // Google Analytics 4 measurement id
  var META_PIXEL_ID = '873948915780740'; // Meta (Facebook) pixel id

  /* ---- Google Analytics 4 ---------------------------------------------- */
  if (GA_ID && GA_ID.indexOf('XXXX') === -1) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  /* ---- Meta pixel ------------------------------------------------------- */
  if (META_PIXEL_ID && /^\d{10,20}$/.test(META_PIXEL_ID)) {
    /* Meta's own loader, kept as they publish it. */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* ---- The site's own conversions --------------------------------------
     Called by the registration form and the Build & Price modal. Both
     platforms hear about the same moment, under the names each one expects:
     generate_lead in Analytics, Lead in Meta. */
  window.QNTrack = {
    lead: function (detail) {
      detail = detail || {};
      try {
        if (window.gtag) {
          window.gtag('event', 'generate_lead', {
            form: detail.form || '',
            model: detail.model || '',
            page: location.pathname
          });
        }
        if (window.fbq) {
          window.fbq('track', 'Lead', {
            content_name: detail.form || 'Registration',
            content_category: detail.model || ''
          });
        }
      } catch (e) { /* measurement must never break a submission */ }
    },

    /* A visitor who configured a car and asked for the quotation. */
    quote: function (detail) {
      detail = detail || {};
      try {
        if (window.gtag) {
          window.gtag('event', 'generate_lead', {
            form: 'Quote download',
            model: detail.model || '',
            page: location.pathname
          });
        }
        if (window.fbq) {
          window.fbq('track', 'Lead', {
            content_name: 'Quote download',
            content_category: detail.model || ''
          });
        }
      } catch (e) { /* same */ }
    }
  };
})();
