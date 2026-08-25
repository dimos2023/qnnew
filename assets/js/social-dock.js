/* Floating social dock — WhatsApp is always one tap away; a gold arrow
   expands Instagram, Facebook and TikTok above it. Self-contained. */
(function () {
  if (document.getElementById('qn-social-dock')) return;

  var SOCIALS = [
    { key: 'wa', label: 'Chat on WhatsApp', href: 'https://wa.me/201060108394',
      icon: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9.4 3 4 8.1 4 14.3c0 2.3.7 4.4 2 6.2L4 29l8-2.1c1.3.4 2.7.6 4 .6 6.6 0 12-5.1 12-11.3C28 8.1 22.6 3 16 3zm0 20.6c-1.2 0-2.4-.2-3.5-.7l-.3-.1-4.7 1.2 1.3-4.4-.3-.4C7.4 18 6.7 16.2 6.7 14.3c0-5 4.4-9.1 9.8-9.1s9.8 4.1 9.8 9.1-4.4 9.1-9.8 9.1zm5.4-6.7c-.3-.1-1.8-.9-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8.9-1 .9s-.5-.1-.8-.2c-.2-.1-1.5-.6-2.8-1.9-1-.9-1.6-2-1.8-2.3-.2-.3 0-.5.1-.6.1-.1.2-.3.3-.4.1-.1.1-.2.2-.3.1-.1.1-.2.2-.3.1-.2 0-.4 0-.5 0-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1-1.1 2.4s1.1 2.8 1.3 3c.2.3 2.2 3.3 5.4 4.5.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3z"/></svg>' },
    { key: 'ig', label: 'Follow on Instagram', href: 'https://www.instagram.com/qn.automotive',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.12 1.38C1.36 2.67.95 3.34.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.38 2.13.66.66 1.33 1.07 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.8-.31 1.47-.72 2.13-1.38.66-.66 1.07-1.33 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.12A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z"/></svg>' },
    { key: 'fb', label: 'Follow on Facebook', href: 'https://www.facebook.com/qn.automotive',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>' },
    { key: 'tt', label: 'Follow on TikTok', href: 'https://www.tiktok.com/@qn.automotive',
      icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.2v12.6a2.6 2.6 0 0 1-2.6 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.4-2.48V7.8a5.8 5.8 0 0 0-.8-.05A5.82 5.82 0 0 0 4 13.5a5.82 5.82 0 0 0 9.94 4.11 5.8 5.8 0 0 0 1.7-4.11V8.9a7.5 7.5 0 0 0 4.36 1.4V7.1a4.28 4.28 0 0 1-3.4-1.28z"/></svg>' }
  ];

  var style = document.createElement('style');
  style.textContent = [
    '.qn-social-dock{position:fixed;inset-inline-end:clamp(14px,3vw,26px);bottom:clamp(18px,5vw,30px);z-index:1400;display:flex;flex-direction:column-reverse;align-items:center;gap:12px}',
    '.qn-fab{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;text-decoration:none;border:1px solid rgba(0,0,0,.18);box-shadow:0 12px 30px rgba(0,0,0,.4);cursor:pointer;transition:transform .18s ease,box-shadow .18s ease,opacity .25s ease}',
    '.qn-fab:hover,.qn-fab:focus-visible{transform:translateY(-2px) scale(1.05);box-shadow:0 16px 38px rgba(0,0,0,.5);outline:none}',
    '.qn-fab svg{width:25px;height:25px;fill:#fff}',
    '.qn-fab.wa{background:#25d366}',
    '.qn-fab.ig{background:radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285AEB 90%)}',
    '.qn-fab.fb{background:#1877f2}',
    '.qn-fab.tt{background:#010101;border-color:rgba(255,255,255,.22)}',
    '.qn-dock-toggle{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:#0b0c0f;border:1px solid rgba(212,175,55,.55);box-shadow:0 10px 26px rgba(0,0,0,.42);cursor:pointer;transition:transform .18s ease,border-color .18s ease}',
    '.qn-dock-toggle:hover,.qn-dock-toggle:focus-visible{transform:translateY(-2px) scale(1.05);border-color:rgba(212,175,55,.95);outline:none}',
    '.qn-dock-toggle svg{width:22px;height:22px;fill:none;stroke:#e8c877;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;transition:transform .28s ease}',
    '.qn-social-dock.open .qn-dock-toggle svg{transform:rotate(180deg)}',
    '.qn-dock-items{display:flex;flex-direction:column;align-items:center;gap:12px;max-height:0;opacity:0;overflow:hidden;transform:translateY(10px);pointer-events:none;transition:max-height .3s ease,opacity .22s ease,transform .3s ease}',
    '.qn-social-dock.open .qn-dock-items{max-height:240px;opacity:1;transform:none;pointer-events:auto}',
    '@media (prefers-reduced-motion:reduce){.qn-fab,.qn-dock-items,.qn-dock-toggle,.qn-dock-toggle svg{transition:none}}'
  ].join('');
  document.head.appendChild(style);

  var dock = document.createElement('div');
  dock.className = 'qn-social-dock';
  dock.id = 'qn-social-dock';

  function makeSocial(s) {
    var a = document.createElement('a');
    a.className = 'qn-fab ' + s.key;
    a.href = s.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', s.label);
    a.innerHTML = s.icon;
    return a;
  }

  var wa = SOCIALS[0];
  var rest = SOCIALS.slice(1);

  dock.appendChild(makeSocial(wa)); // WhatsApp — always visible anchor

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'qn-dock-toggle';
  toggle.setAttribute('aria-label', 'More contact channels');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 15 12 9 18 15"></polyline></svg>';
  dock.appendChild(toggle);

  var items = document.createElement('div');
  items.className = 'qn-dock-items';
  rest.forEach(function (s) { items.appendChild(makeSocial(s)); });
  dock.appendChild(items);

  function setOpen(open) {
    dock.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!dock.classList.contains('open'));
  });
  document.addEventListener('click', function (e) {
    if (!dock.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  document.body.appendChild(dock);
})();
