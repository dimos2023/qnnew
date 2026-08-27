/* Google Analytics 4 loader for QN Automotive.
   Paste your GA4 Measurement ID below (looks like G-XXXXXXXXXX). Until you do,
   this file does nothing — no external calls, no errors. Once set, it tracks
   visits, engagement time and page views across the whole site. */
(function () {
  var GA_ID = 'G-GQD8V39HTZ';   // QN Automotive GA4 Measurement ID

  if (!GA_ID || GA_ID.indexOf('XXXX') !== -1) return;   // not configured yet

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
})();
