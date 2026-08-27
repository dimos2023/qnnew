/* QN AUTOMOTIVE — Build & Price configurator.
   Works for all models. The viewer stage is intentionally left empty — drop
   your 3D model (<model-viewer>) or per-option renders into #cfg-stage-media.
   Everything below (models, options, prices) is plain data — edit freely. */
(function () {
  'use strict';

  /* Prices are stored in USD and shown in the selected country's currency.
     Country comes from the flag selector (window.LegacyI18n). */
  var CURRENCIES = {
    us: { code: 'USD', symbol: '$',   rate: 1,    vat: 0 },
    ae: { code: 'AED', symbol: 'د.إ', rate: 3.67, vat: 0.05 },
    sa: { code: 'SAR', symbol: 'ر.س', rate: 3.75, vat: 0.15 },
    eg: { code: 'EGP', symbol: 'ج.م', rate: 48,   vat: 0.14 }
  };
  var ORDER_FEE_USD = 500;

  /* Same Google Sheet the forms use — we log each downloaded quotation here so
     the admin dashboard can show how many quotes each model generated. */
  var SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycby4P7oZLtUMhHeVkLHki14FjOcw9gN_-yZHWLqx6ZTq26WoOkiIdHiWusmjkhXURbzO/exec';
  function logQuote(m, priceStr, configStr) {
    if (!SHEET_ENDPOINT) return;
    try {
      var body = new URLSearchParams({
        _form: 'Quote download — ' + m.name,
        model: m.name,
        message: 'Full Package ' + priceStr + (configStr ? ' · ' + configStr : ''),
        _page: location.pathname
      });
      fetch(SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', body: body });
    } catch (e) {}
  }

  /* Live daily FX. The rates in CURRENCIES are fallbacks; on load we fetch
     today's USD rates (once a day, cached) so every country's price tracks the
     real dollar rate. S800's base is anchored to an EGP list price (below). */
  function applyRates(r) {
    if (r.EGP) CURRENCIES.eg.rate = r.EGP;
    if (r.AED) CURRENCIES.ae.rate = r.AED;
    if (r.SAR) CURRENCIES.sa.rate = r.SAR;
  }
  function loadRates() {
    var today = new Date().toISOString().slice(0, 10);
    try {
      var cached = JSON.parse(localStorage.getItem('qn_fx') || 'null');
      if (cached && cached.date === today && cached.rates) { applyRates(cached.rates); return Promise.resolve(); }
    } catch (e) {}
    return fetch('https://open.er-api.com/v6/latest/USD')
      .then(function (res) { return res.json(); })
      .then(function (d) {
        if (d && d.result === 'success' && d.rates) {
          var rates = { EGP: d.rates.EGP, AED: d.rates.AED, SAR: d.rates.SAR };
          applyRates(rates);
          try { localStorage.setItem('qn_fx', JSON.stringify({ date: today, rates: rates })); } catch (e) {}
        }
      })
      .catch(function () { /* keep the fallback rates already in CURRENCIES */ });
  }
  /* Base price in USD. A model with baseEgp is anchored to an EGP list price and
     converted at today's live rate; otherwise base is already in USD. */
  function baseUsd(m) {
    return m.baseEgp ? (m.baseEgp / (CURRENCIES.eg.rate || 48)) : m.base;
  }

  /* ---- Model + option data (edit here) ---- */
  var MODELS = [
    {
      id: 's800', name: 'MAEXTRO S800', eyebrow: 'The Flagship', eyebrowAr: 'الطراز الرائد',
      base: 178000, baseEgp: 18900000,
      groups: [
        { id: 'exterior', label: 'Exterior finish', labelAr: 'اللون الخارجي', type: 'swatch', options: [
          { id: 'e1', name: 'Starlight Black', nameAr: 'أسود النجوم', css: 'linear-gradient(135deg,#15151a,#3a3a42)', price: 0 },
          { id: 'e2', name: 'Moonlight Silver', nameAr: 'فضي القمر', css: 'linear-gradient(135deg,#dfe1e5,#9a9da2)', price: 0 },
          { id: 'e3', name: 'Cloud Silver-Purple', nameAr: 'فضي بنفسجي', css: 'linear-gradient(135deg,#c3bccf,#6d6a7e)', price: 1200 },
          { id: 'e4', name: 'Dawn Gold Black', nameAr: 'ذهبي الفجر', css: 'linear-gradient(135deg,#e6d3b3,#1b1b1f)', price: 1200 },
          { id: 'e5', name: 'Wilderness Brown-Gold', nameAr: 'بني ذهبي', css: 'linear-gradient(135deg,#cba97c,#5a4230)', price: 1800 },
          { id: 'e6', name: 'Soaring Ink White', nameAr: 'أبيض لؤلؤي', css: 'linear-gradient(135deg,#eef0f2,#cdd0d4)', price: 0 }
        ]},
        { id: 'interior', label: 'Interior', labelAr: 'المقصورة', type: 'swatch', options: [
          { id: 'i1', name: 'Obsidian & Chrome', nameAr: 'أسود وكروم', css: 'linear-gradient(135deg,#1b1b1f,#4a4a50)', price: 0 },
          { id: 'i2', name: 'Champagne Nappa', nameAr: 'جلد شمبانيا', css: 'linear-gradient(135deg,#e6d3b3,#b79a70)', price: 0 },
          { id: 'i3', name: 'Cognac & Walnut', nameAr: 'كونياك وجوز', css: 'linear-gradient(135deg,#8a5a34,#3a2a1a)', price: 1500 }
        ]},
        { id: 'wheels', label: 'Wheels', labelAr: 'الجنوط', type: 'tile', options: [
          { id: 'w1', name: '20" 30-spoke Starglow', nameAr: '20 بوصة ستارغلو', price: 0 },
          { id: 'w2', name: '20" 12-hole Splendor-Moon', nameAr: '20 بوصة سبلندور', price: 2500 },
          { id: 'w3', name: '21" 25-hole Sun-Glow', nameAr: '21 بوصة صن-غلو', price: 4000 }
        ]},
        { id: 'roof', label: 'Roof', labelAr: 'السقف', type: 'tile', options: [
          { id: 'r0', name: 'Body-colour roof', nameAr: 'سقف بلون الهيكل', price: 0 },
          { id: 'r1', name: 'Panoramic starlight glass', nameAr: 'سقف زجاجي بانورامي', price: 2200 }
        ]},
        { id: 'packages', label: 'Premium packages', labelAr: 'الباقات المميزة', type: 'multi', options: [
          { id: 'p1', name: 'Rear Executive Suite + Smart Interaction', nameAr: 'جناح تنفيذي خلفي + تفاعل ذكي', price: 8000 },
          { id: 'p2', name: 'Rear Privacy Light Curtain', nameAr: 'ستارة ضوئية خلفية', price: 4000 },
          { id: 'p3', name: 'Electronic Side Mirrors', nameAr: 'مرايا جانبية إلكترونية', price: 3000 }
        ]},
        { id: 'accessories', label: 'Accessories', labelAr: 'الإكسسوارات', type: 'multi', options: [
          { id: 'a1', name: 'Portable Charging Adapter', nameAr: 'محول شحن محمول', price: 950 },
          { id: 'a2', name: 'Fitted All-weather Mats', nameAr: 'دواسات لكل الفصول', price: 480 }
        ]}
      ]
    },
    {
      id: 'u9', name: 'YANGWANG U9', eyebrow: 'The Hypercar', eyebrowAr: 'الهايبركار',
      base: 236000, baseEgp: 27500000,
      groups: [
        { id: 'exterior', label: 'Exterior finish', labelAr: 'اللون الخارجي', type: 'swatch', options: [
          { id: 'e1', name: 'Red Glow Danzhu', nameAr: 'أحمر متوهج', css: 'linear-gradient(135deg,#c1121f,#7a0a12)', price: 0 },
          { id: 'e2', name: 'Moonlight Silver', nameAr: 'فضي القمر', css: 'linear-gradient(135deg,#d6d8dc,#8a8d92)', price: 0 },
          { id: 'e3', name: 'Argyle Purple', nameAr: 'بنفسجي', css: 'linear-gradient(135deg,#4a2a6a,#1e1030)', price: 1500 },
          { id: 'e4', name: 'Track Matte Grey', nameAr: 'رمادي مطفي', css: 'linear-gradient(135deg,#3a3c40,#1c1e22)', price: 2400 }
        ]},
        { id: 'interior', label: 'Interior', labelAr: 'المقصورة', type: 'swatch', options: [
          { id: 'i1', name: 'Race Alcantara Black', nameAr: 'ألكانتارا أسود', css: 'linear-gradient(135deg,#1b1b1f,#44444a)', price: 0 },
          { id: 'i2', name: 'Red Carbon Weave', nameAr: 'كربون أحمر', css: 'linear-gradient(135deg,#5a1015,#1a0a0c)', price: 2000 }
        ]},
        { id: 'wheels', label: 'Wheels', labelAr: 'الجنوط', type: 'tile', options: [
          { id: 'w1', name: '21" Forged Aero', nameAr: '21 بوصة مطروق', price: 0 },
          { id: 'w2', name: '20" Track e-GTR', nameAr: '20 بوصة تراك', price: 5200 }
        ]},
        { id: 'packages', label: 'Performance packages', labelAr: 'باقات الأداء', type: 'multi', options: [
          { id: 'p1', name: 'Full Carbon-fibre Aero Kit', nameAr: 'طقم أيرو كربون كامل', price: 12000 },
          { id: 'p2', name: 'Carbon-ceramic Brake Upgrade', nameAr: 'فرامل سيراميك كربوني', price: 9000 },
          { id: 'p3', name: 'Track Telemetry Suite', nameAr: 'حزمة تيليمتري الحلبة', price: 3500 }
        ]},
        { id: 'accessories', label: 'Accessories', labelAr: 'الإكسسوارات', type: 'multi', options: [
          { id: 'a1', name: 'Fitted Car Cover', nameAr: 'غطاء سيارة مخصص', price: 1200 },
          { id: 'a2', name: 'Portable Charging Adapter', nameAr: 'محول شحن محمول', price: 950 }
        ]}
      ]
    },
    {
      id: 'u8l', name: 'YANGWANG U8L', eyebrow: 'The Luxury SUV', eyebrowAr: 'الـ SUV الفاخرة',
      base: 179000, baseEgp: 22200000,
      groups: [
        { id: 'exterior', label: 'Exterior finish', labelAr: 'اللون الخارجي', type: 'swatch', options: [
          { id: 'e1', name: 'Obsidian Black', nameAr: 'أسود أوبسيديان', css: 'linear-gradient(135deg,#141416,#33343a)', price: 0 },
          { id: 'e2', name: 'Glacier White', nameAr: 'أبيض جليدي', css: 'linear-gradient(135deg,#eef0f2,#cdd0d4)', price: 0 }
        ]},
        { id: 'interior', label: 'Interior', labelAr: 'المقصورة', type: 'swatch', options: [
          { id: 'i1', name: 'Executive Cream', nameAr: 'كريمي تنفيذي', css: 'linear-gradient(135deg,#e8ddc7,#bda986)', price: 0 },
          { id: 'i2', name: 'Onyx & Gold', nameAr: 'أونيكس وذهب', css: 'linear-gradient(135deg,#1b1b1f,#7a6a3a)', price: 2500 }
        ]},
        { id: 'wheels', label: 'Wheels', labelAr: 'الجنوط', type: 'tile', options: [
          { id: 'w1', name: '23" Multi-spoke Polished', nameAr: '23 بوصة ملمع', price: 0 },
          { id: 'w2', name: '23" Gloss-black Off-road', nameAr: '23 بوصة أسود لامع', price: 1800 }
        ]},
        { id: 'packages', label: 'Premium packages', labelAr: 'الباقات المميزة', type: 'multi', options: [
          { id: 'p1', name: 'Six-seat Zero-Gravity Lounge', nameAr: 'صالون ستة مقاعد', price: 9000 },
          { id: 'p2', name: 'Rear Cinema + 32-speaker Dynaudio', nameAr: 'سينما خلفية + صوت', price: 6500 },
          { id: 'p3', name: 'Off-road Master Pack', nameAr: 'حزمة الطرق الوعرة', price: 5000 }
        ]},
        { id: 'accessories', label: 'Accessories', labelAr: 'الإكسسوارات', type: 'multi', options: [
          { id: 'a1', name: 'Deployable Side Steps', nameAr: 'سلالم جانبية', price: 1400 },
          { id: 'a2', name: 'Compressor Cool-box', nameAr: 'ثلاجة كهربائية', price: 1100 }
        ]}
      ]
    }
  ];

  /* ---- State ---- */
  var state = { model: MODELS[0].id, single: {}, multi: {} };

  /* Interactive 3D viewer per model. The embedded app hides its own chrome and
     is driven by postMessage (exterior/interior colour, wheels, camera view) —
     its option codes (e1-e6, i1-i6, w1-w3) match the groups above. */
  var VIEWER = {
    s800: '/assets/models/s800/maextro-s800-web-3d/index.html?SN=5008010020201',
    u8l:  '/assets/models/u8l/yangwang-u8-360/index.html?embed=1'
  };
  function viewerFrame() { return document.querySelector('#cfg-stage-media iframe.cfg-3d'); }
  function postViewer(msg) {
    var f = viewerFrame();
    if (f && f.contentWindow) { try { f.contentWindow.postMessage(msg, '*'); } catch (e) {} }
  }
  function pushCurrentToViewer() {
    var m = model(); if (!VIEWER[m.id]) return;
    postViewer({ type: 'maextroSetView', view: 'exterior' });
    if (state.single.exterior) postViewer({ type: 'maextroSetOption', kind: 'exterior', value: state.single.exterior });
    if (state.single.wheels)   postViewer({ type: 'maextroSetOption', kind: 'wheels',   value: state.single.wheels });
  }
  /* Push an option change to the 3D car; switch camera to the right view. */
  function syncViewer(gid, oid) {
    if (!VIEWER[model().id]) return;
    if (gid === 'exterior') { postViewer({ type: 'maextroSetView', view: 'exterior' }); postViewer({ type: 'maextroSetOption', kind: 'exterior', value: oid }); }
    else if (gid === 'interior') { postViewer({ type: 'maextroSetView', view: 'interior' }); postViewer({ type: 'maextroSetOption', kind: 'interior', value: oid }); }
    else if (gid === 'wheels') { postViewer({ type: 'maextroSetView', view: 'exterior' }); postViewer({ type: 'maextroSetOption', kind: 'wheels', value: oid }); }
  }

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var lang = function () { return (window.LegacyI18n && window.LegacyI18n.lang) || 'en'; };
  var country = function () { return (window.LegacyI18n && window.LegacyI18n.getCountry && window.LegacyI18n.getCountry()) || 'us'; };
  var isAr = function () { return lang() === 'ar'; };
  var t = function (o, key) { return (isAr() && o[key + 'Ar']) ? o[key + 'Ar'] : o[key]; };

  function model() { for (var i = 0; i < MODELS.length; i++) if (MODELS[i].id === state.model) return MODELS[i]; return MODELS[0]; }

  function fmt(usd) {
    var c = CURRENCIES[country()] || CURRENCIES.us;
    var v = Math.round(usd * c.rate);
    var s = v.toLocaleString(isAr() ? 'ar-EG' : 'en-US');
    return isAr() ? (s + ' ' + c.symbol) : (c.symbol + s);
  }

  /* Default selections = first option of each single-select group. */
  function resetSelections() {
    state.single = {}; state.multi = {};
    model().groups.forEach(function (g) {
      if (g.type === 'multi') state.multi[g.id] = {};
      else state.single[g.id] = g.options[0].id;
    });
  }

  function selectedExterior() {
    var g = model().groups.filter(function (x) { return x.id === 'exterior'; })[0];
    if (!g) return null;
    var id = state.single.exterior;
    return g.options.filter(function (o) { return o.id === id; })[0] || g.options[0];
  }

  function total() {
    var m = model(), sum = baseUsd(m);
    m.groups.forEach(function (g) {
      if (g.type === 'multi') {
        g.options.forEach(function (o) { if (state.multi[g.id] && state.multi[g.id][o.id]) sum += o.price; });
      } else {
        var id = state.single[g.id];
        g.options.forEach(function (o) { if (o.id === id) sum += o.price; });
      }
    });
    return sum;
  }

  /* ---- Render ---- */
  function renderTabs() {
    var host = $('#cfg-tabs'); if (!host) return;
    host.innerHTML = MODELS.map(function (m) {
      return '<button type="button" class="cfg-tab' + (m.id === state.model ? ' is-active' : '') +
        '" data-model="' + m.id + '">' + m.name + '</button>';
    }).join('');
    host.querySelectorAll('[data-model]').forEach(function (b) {
      b.addEventListener('click', function () { state.model = b.getAttribute('data-model'); resetSelections(); renderAll(); });
    });
  }

  function renderStage() {
    var m = model(), ext = selectedExterior();
    var eyebrow = $('#cfg-stage-eyebrow'), name = $('#cfg-stage-name'), finish = $('#cfg-stage-finish'), media = $('#cfg-stage-media');
    if (eyebrow) eyebrow.textContent = t(m, 'eyebrow');
    if (name) name.textContent = m.name;
    if (finish) finish.textContent = ext ? t(ext, 'name') : '';
    if (!media) return;
    var stage = media.closest('.cfg-stage');
    var url = VIEWER[m.id];
    if (url) {
      /* Interactive 3D viewer for this model. Recreate the iframe only when the
         MODEL changes (not on every re-render) so switching straight between two
         3D models loads the right car instead of keeping the previous one. */
      if (stage) stage.classList.add('has-3d');
      var f = viewerFrame();
      if (!f || f.getAttribute('data-model') !== m.id) {
        if (f) f.remove();
        media.style.background = '#0d0d0d';
        f = document.createElement('iframe');
        f.className = 'cfg-3d';
        f.setAttribute('data-model', m.id);
        f.title = m.name + ' — interactive 3D';
        f.setAttribute('allow', 'accelerometer; gyroscope; xr-spatial-tracking; fullscreen');
        f.addEventListener('load', pushCurrentToViewer);
        f.src = url;
        media.appendChild(f);
      }
    } else {
      /* No 3D model yet — tint the stage with the chosen finish. */
      if (stage) stage.classList.remove('has-3d');
      var old = viewerFrame(); if (old) old.remove();
      if (ext) media.style.background =
        'radial-gradient(120% 90% at 50% 20%, rgba(255,255,255,.05), transparent 60%), ' + ext.css;
    }
  }

  function renderGroups() {
    var host = $('#cfg-groups'); if (!host) return;
    var m = model();
    host.innerHTML = m.groups.map(function (g) {
      var opts;
      if (g.type === 'swatch') {
        opts = g.options.map(function (o) {
          var on = state.single[g.id] === o.id;
          return '<button type="button" class="cfg-swatch' + (on ? ' is-on' : '') + '" data-g="' + g.id + '" data-o="' + o.id +
            '" title="' + t(o, 'name') + '"><span class="sw" style="background:' + o.css + '"></span>' +
            '<span class="cfg-oname">' + t(o, 'name') + (o.price ? ' <em>+' + fmt(o.price) + '</em>' : '') + '</span></button>';
        }).join('');
      } else if (g.type === 'tile') {
        opts = g.options.map(function (o) {
          var on = state.single[g.id] === o.id;
          return '<button type="button" class="cfg-tile' + (on ? ' is-on' : '') + '" data-g="' + g.id + '" data-o="' + o.id + '">' +
            '<span class="cfg-oname">' + t(o, 'name') + '</span>' +
            '<span class="cfg-oprice">' + (o.price ? '+' + fmt(o.price) : (isAr() ? 'مشمول' : 'Included')) + '</span></button>';
        }).join('');
      } else { /* multi */
        opts = g.options.map(function (o) {
          var on = state.multi[g.id] && state.multi[g.id][o.id];
          return '<button type="button" class="cfg-add' + (on ? ' is-on' : '') + '" data-g="' + g.id + '" data-o="' + o.id + '" role="checkbox" aria-checked="' + (on ? 'true' : 'false') + '">' +
            '<span class="cfg-check" aria-hidden="true"></span>' +
            '<span class="cfg-oname">' + t(o, 'name') + '</span>' +
            '<span class="cfg-oprice">+' + fmt(o.price) + '</span></button>';
        }).join('');
      }
      return '<section class="cfg-group"><h3 class="cfg-glabel">' + t(g, 'label') + '</h3>' +
        '<div class="cfg-opts ' + g.type + '">' + opts + '</div></section>';
    }).join('');

    host.querySelectorAll('[data-g]').forEach(function (b) {
      b.addEventListener('click', function () {
        var gid = b.getAttribute('data-g'), oid = b.getAttribute('data-o');
        var grp = m.groups.filter(function (x) { return x.id === gid; })[0];
        if (grp.type === 'multi') {
          state.multi[gid] = state.multi[gid] || {};
          state.multi[gid][oid] = !state.multi[gid][oid];
        } else {
          state.single[gid] = oid;
          syncViewer(gid, oid);   // drive the live 3D car
        }
        renderGroups(); renderStage(); renderSummary();
      });
    });
  }

  function renderSummary() {
    var sub = total(), m = model();
    var c = CURRENCIES[country()] || CURRENCIES.us;
    var setTxt = function (id, v) { var e = $(id); if (e) e.textContent = v; };
    var vl = $('#cfg-vat-label');
    setTxt('#cfg-subtotal', fmt(sub));
    if (m.baseEgp) {
      /* Full Package: an all-inclusive price — tax is already included. */
      if (vl) vl.textContent = isAr() ? 'الضريبة' : 'VAT';
      setTxt('#cfg-vat', isAr() ? 'مشمولة' : 'Included');
      setTxt('#cfg-total', fmt(sub));
    } else {
      var vat = Math.round(sub * c.rate * c.vat) / c.rate; // keep in USD terms for fmt
      if (vl) vl.textContent = (isAr() ? 'ضريبة القيمة المضافة ' : 'VAT ') + Math.round(c.vat * 100) + '%';
      setTxt('#cfg-vat', fmt(vat));
      setTxt('#cfg-total', fmt(sub + vat));
    }
    setTxt('#cfg-fee', fmt(ORDER_FEE_USD));
  }

  function renderAll() { renderTabs(); renderStage(); renderGroups(); renderSummary(); }

  /* ---- CTAs ---- */
  function buildSummaryText() {
    var m = model(), lines = [(isAr() ? 'طلب تكوين — ' : 'Configuration — ') + m.name];
    m.groups.forEach(function (g) {
      if (g.type === 'multi') {
        g.options.forEach(function (o) { if (state.multi[g.id] && state.multi[g.id][o.id]) lines.push('• ' + t(g, 'label') + ': ' + t(o, 'name')); });
      } else {
        var id = state.single[g.id];
        g.options.forEach(function (o) { if (o.id === id) lines.push('• ' + t(g, 'label') + ': ' + t(o, 'name')); });
      }
    });
    lines.push((isAr() ? 'الإجمالي التقديري: ' : 'Estimated total: ') + fmt(total()));
    return lines.join('\n');
  }

  /* English currency string for the PDF (jsPDF core fonts can't render Arabic). */
  function fmtEn(usd) {
    var c = CURRENCIES[country()] || CURRENCIES.us;
    return Math.round(usd * c.rate).toLocaleString('en-US') + ' ' + c.code;
  }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function loadImage(url) {
    return new Promise(function (res) {
      var img = new Image();
      img.onload = function () {
        try {
          var cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
          cv.getContext('2d').drawImage(img, 0, 0);
          res({ data: cv.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight });
        } catch (e) { res(null); }
      };
      img.onerror = function () { res(null); };
      img.src = url;
    });
  }
  function selectedRows() {
    var m = model(), rows = [];
    m.groups.forEach(function (g) {
      if (g.type === 'multi') {
        g.options.forEach(function (o) { if (state.multi[g.id] && state.multi[g.id][o.id]) rows.push([g.label, o.name, '+ ' + fmtEn(o.price)]); });
      } else {
        var id = state.single[g.id];
        g.options.forEach(function (o) { if (o.id === id) rows.push([g.label, o.name, o.price ? '+ ' + fmtEn(o.price) : 'Included']); });
      }
    });
    return rows;
  }

  /* Branded PDF quotation: crest + configuration + Full Package price + contacts. */
  function downloadPdf() {
    var ready = window.jspdf ? Promise.resolve() : loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
    ready.then(function () { return loadImage('/assets/brand/qn-crest.png'); }).then(function (logo) {
      var jsPDF = window.jspdf.jsPDF, doc = new jsPDF({ unit: 'pt', format: 'a4' });
      var W = doc.internal.pageSize.getWidth(), L = 56, R = W - 56;
      var GOLD = [183, 147, 90], INK = [26, 26, 30], DIM = [120, 120, 128];
      var m = model(), d = new Date(), y = 52;
      var setInk = function () { doc.setTextColor(INK[0], INK[1], INK[2]); };
      var setDim = function () { doc.setTextColor(DIM[0], DIM[1], DIM[2]); };
      if (logo) { var lw = 104, lh = lw * logo.h / logo.w; doc.addImage(logo.data, 'PNG', (W - lw) / 2, y, lw, lh); y += lh + 4; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(15); setInk();
      doc.text('QN AUTOMOTIVE', W / 2, y, { align: 'center' }); y += 15;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setDim();
      doc.text('VEHICLE CONFIGURATION QUOTATION', W / 2, y, { align: 'center', charSpace: 1.5 }); y += 20;
      doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]); doc.setLineWidth(1); doc.line(L, y, R, y); y += 26;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(19); setInk(); doc.text(m.name, L, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); setDim();
      doc.text('Date: ' + d.toLocaleDateString('en-GB'), R, y - 12, { align: 'right' });
      doc.text('Ref: QN-' + m.id.toUpperCase() + '-' + (d.getTime() + '').slice(-6), R, y, { align: 'right' });
      doc.text(m.eyebrow, L, y + 14); y += 34;
      doc.setFontSize(8); setDim();
      doc.text('SPECIFICATION', L, y); doc.text('SELECTION', 215, y); doc.text('PRICE', R, y, { align: 'right' }); y += 6;
      doc.setDrawColor(220, 220, 224); doc.setLineWidth(0.6); doc.line(L, y, R, y); y += 15;
      doc.setFontSize(10);
      selectedRows().forEach(function (r) {
        setDim(); doc.text(r[0], L, y);
        setInk(); doc.text(r[1], 215, y, { maxWidth: 200 });
        doc.text(r[2], R, y, { align: 'right' }); y += 17;
      });
      y += 6; doc.setDrawColor(220, 220, 224); doc.line(L, y, R, y); y += 22;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); setInk();
      doc.text('Full Package Total', L, y); doc.text(fmtEn(total()), R, y, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setDim();
      doc.text('All-inclusive price · taxes included', R, y + 12, { align: 'right' }); y += 40;
      doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]); doc.setLineWidth(1); doc.line(L, y, R, y); y += 20;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); setInk();
      doc.text('QN Automotive — Elite Concierge', L, y); y += 16;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); setInk();
      doc.text('Phone / WhatsApp:  +20 114 443 3316', L, y); y += 14;
      doc.text('Email:  info@qnautomotive.com', L, y); y += 14;
      doc.text('Website:  www.qnautomotive.com', L, y); y += 26;
      doc.setFontSize(7.5); setDim();
      doc.text('Indicative pricing for guidance only. Your concierge confirms the final, all-inclusive quote and delivery for your market.', L, y, { maxWidth: R - L });
      doc.save('QN-Automotive-' + m.id + '-quotation.pdf');
      logQuote(m, fmtEn(total()), selectedRows().map(function (r) { return r[1]; }).join(', '));
    }).catch(function () {
      var blob = new Blob([buildSummaryText()], { type: 'text/plain' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'qn-configuration-' + state.model + '.txt'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
  }

  function wireCTAs() {
    var wa = $('#cfg-cta-wa');
    if (wa) wa.addEventListener('click', function (e) {
      e.preventDefault();
      window.open('https://wa.me/201144433316?text=' + encodeURIComponent(buildSummaryText()), '_blank', 'noopener');
    });
    var dl = $('#cfg-cta-download');
    if (dl) dl.addEventListener('click', function (e) { e.preventDefault(); downloadPdf(); });
  }

  function init() {
    if (!$('#cfg-groups')) return;
    resetSelections();
    renderAll();
    wireCTAs();
    /* Pull today's live USD rates, then re-price everything. */
    loadRates().then(function () { renderAll(); });
    /* Re-render on country/language change so text, currency and RTL update. */
    window.addEventListener('legacy:langchange', function () { renderAll(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
