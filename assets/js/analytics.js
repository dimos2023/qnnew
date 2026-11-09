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

  /* ---- What the site reports -------------------------------------------
     One call reaches both platforms under the name each expects: a Meta
     standard event, and the nearest GA4 event. Every event carries the page
     and, where there is one, the model — so a report can answer "who did
     what, and on which car".

     Meta events used here:
       PageView           every page
       ViewContent        a model page, or a model chosen in Build & Price
       CustomizeProduct   changed a colour / wheels / package (once a visit)
       InitiateCheckout   opened the quotation form
       Contact            tapped WhatsApp, the phone number or the email
       Lead               sent any enquiry form
       Schedule           booked a test drive
       CompleteRegistration  registered interest                            */

  function send(metaEvent, gaEvent, detail) {
    detail = detail || {};
    var data = {
      page: location.pathname,
      model: detail.model || '',
      label: detail.label || ''
    };
    try {
      if (window.gtag) window.gtag('event', gaEvent, data);
      if (window.fbq) {
        window.fbq('track', metaEvent, {
          content_name: detail.label || document.title,
          content_category: detail.model || '',
          content_type: detail.model ? 'product' : undefined
        });
      }
    } catch (e) { /* measurement must never break the page */ }
  }

  /* The model a page is about, read from the path. */
  var MODEL_BY_PATH = {
    '/models/maextro-s800': 'MAEXTRO S800',
    '/models/yangwang-u9': 'YANGWANG U9',
    '/models/yangwang-u8l': 'YANGWANG U8L'
  };

  var customizedOnce = false;

  window.QNTrack = {
    /* A form reached the sheet. `form` says which one, and the name it
       reports under follows from that. */
    lead: function (detail) {
      detail = detail || {};
      var form = String(detail.form || '');
      send('Lead', 'generate_lead', { label: form, model: detail.model });
      var also = { label: form, model: detail.model };
      if (/test.?drive/i.test(form)) send('Schedule', 'schedule_test_drive', also);
      else if (/interest/i.test(form)) send('CompleteRegistration', 'sign_up', also);
    },

    /* The quotation request from Build & Price. */
    quote: function (detail) {
      detail = detail || {};
      send('Lead', 'generate_lead', { label: 'Quote download', model: detail.model });
    },

    /* Opened the quotation form — intent, before any details are given. */
    quoteStart: function (detail) {
      send('InitiateCheckout', 'begin_checkout', { label: 'Quote form opened', model: (detail || {}).model });
    },

    /* Looked at a car: a model page, or a model picked in the configurator. */
    viewModel: function (model, label) {
      send('ViewContent', 'view_item', { model: model, label: label || model });
    },

    /* Changed something in the configurator. Once a visit is enough to know
       the visitor engaged; every click would drown the account. */
    customize: function (detail) {
      if (customizedOnce) return;
      customizedOnce = true;
      send('CustomizeProduct', 'customize_product', detail);
    },

    /* WhatsApp, phone or email — a conversation started off-site. */
    contact: function (detail) {
      send('Contact', 'contact', detail);
    }
  };

  /* ---- Wiring that needs no change anywhere else -------------------------
     A model page reports itself, and every WhatsApp / phone / email link on
     the site reports a Contact, wherever it sits. */
  var pageModel = MODEL_BY_PATH[location.pathname.replace(/\/$/, '')];
  if (pageModel) window.QNTrack.viewModel(pageModel, pageModel);

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(href)) {
      window.QNTrack.contact({ label: 'WhatsApp', model: pageModel });
    } else if (/^tel:/i.test(href)) {
      window.QNTrack.contact({ label: 'Phone call', model: pageModel });
    } else if (/^mailto:/i.test(href)) {
      window.QNTrack.contact({ label: 'Email', model: pageModel });
    }
  }, true);
})();
