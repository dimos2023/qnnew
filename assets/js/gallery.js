/* Gallery lightbox — open any gallery image full-screen and move between them
   with the arrows, keyboard (←/→/Esc) or a swipe. Self-contained. */
(function () {
  'use strict';
  var links = Array.prototype.slice.call(document.querySelectorAll('.md-gallery-grid a'));
  if (!links.length) return;

  var srcs = links.map(function (a) { return a.getAttribute('href'); });
  var i = 0, open = false;

  var ov = document.createElement('div');
  ov.className = 'qn-lb';
  ov.innerHTML =
    '<button class="qn-lb-close" aria-label="Close">✕</button>' +
    '<button class="qn-lb-nav qn-lb-prev" aria-label="Previous">‹</button>' +
    '<img class="qn-lb-img" alt="">' +
    '<button class="qn-lb-nav qn-lb-next" aria-label="Next">›</button>' +
    '<div class="qn-lb-count"></div>';
  document.body.appendChild(ov);

  var imgEl = ov.querySelector('.qn-lb-img');
  var countEl = ov.querySelector('.qn-lb-count');
  var single = srcs.length < 2;
  if (single) {
    ov.querySelector('.qn-lb-prev').style.display = 'none';
    ov.querySelector('.qn-lb-next').style.display = 'none';
  }

  function show(n) {
    i = (n + srcs.length) % srcs.length;
    imgEl.src = srcs[i];
    countEl.textContent = (i + 1) + ' / ' + srcs.length;
  }
  function openAt(n) { show(n); ov.classList.add('on'); document.body.style.overflow = 'hidden'; open = true; }
  function close() { ov.classList.remove('on'); document.body.style.overflow = ''; open = false; }

  links.forEach(function (a, n) {
    a.addEventListener('click', function (e) { e.preventDefault(); openAt(n); });
  });
  ov.querySelector('.qn-lb-close').addEventListener('click', close);
  ov.querySelector('.qn-lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(i - 1); });
  ov.querySelector('.qn-lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(i + 1); });
  ov.addEventListener('click', function (e) { if (e.target === ov) close(); });

  document.addEventListener('keydown', function (e) {
    if (!open) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(i - 1);
    else if (e.key === 'ArrowRight') show(i + 1);
  });

  // Swipe on touch devices
  var x0 = null;
  ov.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  ov.addEventListener('touchend', function (e) {
    if (x0 === null || single) { x0 = null; return; }
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
