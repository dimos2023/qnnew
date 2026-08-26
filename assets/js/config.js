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

  /* ---- Model + option data (edit here) ---- */
  var MODELS = [
    {
      id: 's800', name: 'MAEXTRO S800', eyebrow: 'The Flagship', eyebrowAr: 'الطراز الرائد',
      base: 178000,
      groups: [
        { id: 'exterior', label: 'Exterior finish', labelAr: 'اللون الخارجي', type: 'swatch', options: [
          { id: 'e1', name: 'Starlight Black', nameAr: 'أسود النجوم', css: 'linear-gradient(135deg,#15151a,#3a3a42)', price: 0 },
          { id: 'e2', name: 'Cloud Silver-Purple', nameAr: 'فضي بنفسجي', css: 'linear-gradient(135deg,#c2bfce,#6d6a7e)', price: 0 },
          { id: 'e3', name: 'Dawn Gold Black', nameAr: 'ذهبي الفجر', css: 'linear-gradient(135deg,#24201a,#8a744c)', price: 1200 },
          { id: 'e4', name: 'Wilderness Brown-Gold', nameAr: 'بني ذهبي', css: 'linear-gradient(135deg,#5a4a34,#c19a6b)', price: 1200 },
          { id: 'e5', name: 'Soaring Ink White', nameAr: 'أبيض لؤلؤي', css: 'linear-gradient(135deg,#eef0f2,#c7cace)', price: 0 },
          { id: 'e6', name: 'Cloud Sunset Glow', nameAr: 'توهج الغروب', css: 'linear-gradient(135deg,#c98a5a,#7a4a34)', price: 1800 }
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
      base: 236000,
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
      base: 179000,
      groups: [
        { id: 'exterior', label: 'Exterior finish', labelAr: 'اللون الخارجي', type: 'swatch', options: [
          { id: 'e1', name: 'Obsidian Black / Sunstone Gold', nameAr: 'أسود / ذهبي', css: 'linear-gradient(135deg,#141416,#8a744c)', price: 0 },
          { id: 'e2', name: 'Glacier White', nameAr: 'أبيض جليدي', css: 'linear-gradient(135deg,#eef0f2,#cdd0d4)', price: 0 },
          { id: 'e3', name: 'Desert Bronze', nameAr: 'برونزي صحراوي', css: 'linear-gradient(135deg,#9a7a4a,#5a4227)', price: 1600 }
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
    var m = model(), sum = m.base;
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
    /* Placeholder visual: tint the stage with the chosen finish. Replace #cfg-stage-media
       with your <model-viewer> or renders when ready. */
    if (media && ext) media.style.background =
      'radial-gradient(120% 90% at 50% 20%, rgba(255,255,255,.05), transparent 60%), ' + ext.css;
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
        }
        renderGroups(); renderStage(); renderSummary();
      });
    });
  }

  function renderSummary() {
    var sub = total();
    var c = CURRENCIES[country()] || CURRENCIES.us;
    var vat = Math.round(sub * c.rate * c.vat) / c.rate; // keep in USD terms for fmt
    var setTxt = function (id, v) { var e = $(id); if (e) e.textContent = v; };
    setTxt('#cfg-subtotal', fmt(sub));
    setTxt('#cfg-vat', fmt(vat));
    setTxt('#cfg-total', fmt(sub + vat));
    setTxt('#cfg-fee', fmt(ORDER_FEE_USD));
    var vl = $('#cfg-vat-label'); if (vl) vl.textContent = (isAr() ? 'ضريبة القيمة المضافة ' : 'VAT ') + Math.round(c.vat * 100) + '%';
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

  function wireCTAs() {
    var wa = $('#cfg-cta-wa');
    if (wa) wa.addEventListener('click', function (e) {
      e.preventDefault();
      window.open('https://wa.me/201144433316?text=' + encodeURIComponent(buildSummaryText()), '_blank', 'noopener');
    });
    var dl = $('#cfg-cta-download');
    if (dl) dl.addEventListener('click', function (e) {
      e.preventDefault();
      var blob = new Blob([buildSummaryText()], { type: 'text/plain' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'qn-configuration-' + state.model + '.txt';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
  }

  function init() {
    if (!$('#cfg-groups')) return;
    resetSelections();
    renderAll();
    wireCTAs();
    /* Re-render on country/language change so text, currency and RTL update. */
    window.addEventListener('legacy:langchange', function () { renderAll(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
