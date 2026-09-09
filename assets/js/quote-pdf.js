/* QN AUTOMOTIVE — branded PDF quotation builder.
   Shared by two callers: the configurator, which builds the customer's copy
   after they leave their details, and the admin dashboard, which rebuilds the
   exact same document for any quotation in the log. Keeping one builder means
   the file the customer received and the file the team re-downloads match. */
(function () {
  'use strict';

  var JSPDF_CDN = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
  var CREST = '/assets/brand/qn-crest.png';
  var GOLD = [183, 147, 90], INK = [26, 26, 30], DIM = [120, 120, 128];

  var crestCache = null;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function loadCrest() {
    if (crestCache) return Promise.resolve(crestCache);
    return new Promise(function (res) {
      var img = new Image();
      img.onload = function () {
        try {
          var cv = document.createElement('canvas');
          cv.width = img.naturalWidth; cv.height = img.naturalHeight;
          cv.getContext('2d').drawImage(img, 0, 0);
          crestCache = { data: cv.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight };
        } catch (e) { crestCache = null; }
        res(crestCache);
      };
      img.onerror = function () { res(null); };
      img.src = CREST;
    });
  }

  /* Reference is generated once, when the customer submits, and stored with the
     quotation — so a re-download from the admin carries the same number. */
  function makeRef(modelId, when) {
    return 'QN-' + String(modelId || 'Q').toUpperCase() + '-' + (String(when || Date.now())).slice(-6);
  }

  /* data = {
       model:    { id, name, eyebrow },
       rows:     [[specification, selection, price], …]   (may be empty)
       total:    '…  EGP'                                  (may be empty)
       note:     free text shown when rows are empty
       ref, date (ms since epoch)
       customer: { name, email, phone }
     } */
  function draw(data, logo) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: 'pt', format: 'a4' });
    var W = doc.internal.pageSize.getWidth(), L = 56, R = W - 56;
    var m = data.model || {}, c = data.customer || {};
    var d = new Date(data.date || Date.now());
    var y = 52;
    var setInk = function () { doc.setTextColor(INK[0], INK[1], INK[2]); };
    var setDim = function () { doc.setTextColor(DIM[0], DIM[1], DIM[2]); };

    if (logo) {
      var lw = 104, lh = lw * logo.h / logo.w;
      doc.addImage(logo.data, 'PNG', (W - lw) / 2, y, lw, lh);
      y += lh + 4;
    }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); setInk();
    doc.text('QN AUTOMOTIVE', W / 2, y, { align: 'center' }); y += 15;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setDim();
    doc.text('VEHICLE CONFIGURATION QUOTATION', W / 2, y, { align: 'center', charSpace: 1.5 }); y += 20;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]); doc.setLineWidth(1); doc.line(L, y, R, y); y += 26;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(19); setInk();
    doc.text(String(m.name || 'Configuration'), L, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setDim();
    doc.text('Date: ' + d.toLocaleDateString('en-GB'), R, y - 12, { align: 'right' });
    doc.text('Ref: ' + (data.ref || makeRef(m.id, data.date)), R, y, { align: 'right' });
    if (m.eyebrow) doc.text(String(m.eyebrow), L, y + 14);
    y += 34;

    /* Prepared for — the details the customer entered before downloading. */
    if (c.name || c.email || c.phone) {
      doc.setFontSize(8); setDim();
      doc.text('PREPARED FOR', L, y); y += 6;
      doc.setDrawColor(220, 220, 224); doc.setLineWidth(0.6); doc.line(L, y, R, y); y += 15;
      doc.setFontSize(10); setInk();
      if (c.name) { doc.text(String(c.name), L, y); y += 15; }
      setDim();
      var contact = [c.email, c.phone].filter(Boolean).join('   ·   ');
      if (contact) { doc.text(contact, L, y); y += 15; }
      y += 12;
    }

    var rows = data.rows || [];
    if (rows.length) {
      doc.setFontSize(8); setDim();
      doc.text('SPECIFICATION', L, y);
      doc.text('SELECTION', 215, y);
      doc.text('PRICE', R, y, { align: 'right' }); y += 6;
      doc.setDrawColor(220, 220, 224); doc.setLineWidth(0.6); doc.line(L, y, R, y); y += 15;
      doc.setFontSize(10);
      rows.forEach(function (r) {
        setDim(); doc.text(String(r[0] == null ? '' : r[0]), L, y);
        setInk();
        doc.text(String(r[1] == null ? '' : r[1]), 215, y, { maxWidth: 200 });
        doc.text(String(r[2] == null ? '' : r[2]), R, y, { align: 'right' });
        y += 17;
      });
      y += 6; doc.setDrawColor(220, 220, 224); doc.line(L, y, R, y); y += 22;
    } else if (data.note) {
      doc.setFontSize(10); setInk();
      doc.text(String(data.note), L, y, { maxWidth: R - L }); y += 30;
      doc.setDrawColor(220, 220, 224); doc.setLineWidth(0.6); doc.line(L, y, R, y); y += 22;
    }

    if (data.total) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); setInk();
      doc.text('Full Package Total', L, y);
      doc.text(String(data.total), R, y, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setDim();
      doc.text('All-inclusive price · taxes included', R, y + 12, { align: 'right' });
      y += 40;
    }

    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]); doc.setLineWidth(1); doc.line(L, y, R, y); y += 20;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); setInk();
    doc.text('QN Automotive — Elite Concierge', L, y); y += 16;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); setInk();
    doc.text('Phone / WhatsApp:  +20 114 443 3316', L, y); y += 14;
    doc.text('Email:  info@qnautomotive.com', L, y); y += 14;
    doc.text('Website:  www.qnautomotive.com', L, y); y += 26;
    doc.setFontSize(7.5); setDim();
    doc.text('Indicative pricing for guidance only. Your concierge confirms the final, all-inclusive quote and delivery for your market.',
      L, y, { maxWidth: R - L });

    return doc;
  }

  function build(data) {
    var ready = window.jspdf ? Promise.resolve() : loadScript(JSPDF_CDN);
    return ready.then(loadCrest).then(function (logo) { return draw(data, logo); });
  }

  function filename(data) {
    var m = (data && data.model) || {};
    return 'QN-Automotive-' + (m.id || 'quotation') + '-quotation.pdf';
  }

  function save(data) {
    return build(data).then(function (doc) { doc.save(filename(data)); return doc; });
  }

  window.QNQuote = { build: build, save: save, filename: filename, makeRef: makeRef };
})();
