/* LEGACY MOTORS — cinematic behaviours: scroll-reveal, sticky header, hero
   parallax. Motion is slow and unhurried; everything respects reduced-motion. */
(() => {
  'use strict';

  // --- Preview helper: ?scrollto=N jumps to a pixel offset (for capture) ---
  const _st = new URLSearchParams(location.search).get('scrollto');
  if (_st) window.addEventListener('load', () => window.scrollTo(0, parseInt(_st, 10)));

  // --- Sticky header: transparent over hero → solid on scroll ---
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Scroll-reveal: fade + rise as elements enter the viewport ---
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const previewMode = new URLSearchParams(location.search).has('preview');
  if (previewMode) document.body.classList.add('capture');
  const reveals = document.querySelectorAll('.reveal');
  if (reduce || previewMode || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  }

  // --- Hero parallax: background media drifts slower than the page ---
  if (!reduce) {
    const heroMedia = document.querySelector('.hero-media img, .hero-media video');
    const bandMedia = document.querySelectorAll('.model-band .band-media img, .model-band .band-media video');
    let ticking = false;
    const parallax = () => {
      const y = window.scrollY;
      if (heroMedia) heroMedia.style.transform = `translate3d(0, ${y * 0.18}px, 0) scale(1.06)`;
      bandMedia.forEach((img) => {
        const rect = img.getBoundingClientRect();
        const offset = (rect.top - window.innerHeight / 2) * -0.05;
        img.style.transform = `translate3d(0, ${offset}px, 0) scale(1.08)`;
      });
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(parallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    parallax();
  }

  // The language toggle is owned by i18n.js (loaded in <head>).

  // Mobile nav drawer — the hamburger opens the full-screen menu.
  (function () {
    var btn = document.querySelector('.menu-btn');
    var nav = document.querySelector('.site-header .nav');
    if (!btn || !nav) return;
    var close = function () {
      document.body.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    };
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !document.body.classList.contains('nav-open');
      document.body.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  })();
})();
