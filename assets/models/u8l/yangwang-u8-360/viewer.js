const frameCount = 24;
const stage = document.querySelector('#stage');
const car = document.querySelector('#car');
const loading = document.querySelector('#loading');
const playButton = document.querySelector('#play');
const colorName = document.querySelector('#colorName');
const swatches = [...document.querySelectorAll('.swatch')];

let color = 'black';
let frame = 8;
let dragging = false;
let startX = 0;
let startFrame = frame;
let timer = null;
const cache = new Map();

function pathFor(selectedColor, index) {
  return `assets/${selectedColor}/${index + 1}.png`;
}

function render() {
  car.src = pathFor(color, frame);
}

function preload(selectedColor) {
  return Promise.all(Array.from({ length: frameCount }, (_, index) => new Promise((resolve) => {
    const image = new Image();
    image.onload = image.onerror = resolve;
    image.src = pathFor(selectedColor, index);
    cache.set(`${selectedColor}-${index}`, image);
  })));
}

function stopAuto() {
  clearInterval(timer);
  timer = null;
  playButton.classList.remove('active');
  playButton.textContent = 'Auto rotate';
}

function toggleAuto() {
  if (timer) return stopAuto();
  timer = setInterval(() => {
    frame = (frame + 1) % frameCount;
    render();
  }, 110);
  playButton.classList.add('active');
  playButton.textContent = 'Stop';
}

// ---- Zoom (wheel + pinch) + rotate (drag) --------------------------------
let zoom = 1;
const ZOOM_MIN = 1, ZOOM_MAX = 2.8;
const pointers = new Map();
let pinchDist = 0, pinchZoom = 1;

const clampZoom = (z) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
function applyZoom() {
  car.style.transform = `scale(${zoom})`;
  stage.style.cursor = zoom > 1.01 ? 'zoom-out' : 'grab';
}

function pointerDown(event) {
  pointers.set(event.pointerId, event);
  stage.setPointerCapture?.(event.pointerId);
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinchDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    pinchZoom = zoom;
    dragging = false;
  } else {
    stopAuto();
    dragging = true;
    startX = event.clientX;
    startFrame = frame;
  }
}

function pointerMove(event) {
  if (pointers.has(event.pointerId)) pointers.set(event.pointerId, event);
  if (pointers.size === 2) {            // pinch to zoom
    const [a, b] = [...pointers.values()];
    const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    if (pinchDist > 0) { zoom = clampZoom(pinchZoom * (dist / pinchDist)); applyZoom(); }
    return;
  }
  if (!dragging) return;                // drag to rotate (same direction as the drag)
  const delta = Math.round((event.clientX - startX) / 18);
  frame = ((startFrame + delta) % frameCount + frameCount) % frameCount;
  render();
}

function pointerUp(event) {
  pointers.delete(event.pointerId);
  if (pointers.size < 2) pinchDist = 0;
  if (pointers.size === 1) {            // one finger left — resume rotating from here
    const p = [...pointers.values()][0];
    startX = p.clientX; startFrame = frame; dragging = true;
  } else if (pointers.size === 0) {
    dragging = false;
  }
}

stage.addEventListener('pointerdown', pointerDown);
stage.addEventListener('pointermove', pointerMove);
stage.addEventListener('pointerup', pointerUp);
stage.addEventListener('pointercancel', pointerUp);
stage.addEventListener('wheel', (event) => {
  event.preventDefault();
  zoom = clampZoom(zoom - event.deltaY * 0.0016);
  applyZoom();
}, { passive: false });
stage.addEventListener('dblclick', () => { zoom = 1; applyZoom(); });
playButton.addEventListener('click', toggleAuto);

swatches.forEach((swatch) => swatch.addEventListener('click', async () => {
  color = swatch.dataset.color;
  colorName.textContent = swatch.dataset.name;
  swatches.forEach((item) => item.classList.toggle('active', item === swatch));
  await preload(color);
  render();
}));

Promise.all([preload('black'), preload('white')]).then(() => {
  render();
  loading.classList.add('hidden');
});

// Bridge: let the QN configurator's side panel drive the exterior colour
// (same message shape as the S800 viewer). e1 = black, e2 = white.
window.addEventListener('message', (event) => {
  const d = event && event.data;
  if (!d || d.type !== 'maextroSetOption' || d.kind !== 'exterior') return;
  const c = { e1: 'black', e2: 'white' }[d.value];
  if (!c) return;
  const sw = swatches.find((s) => s.dataset.color === c);
  if (sw) sw.click();
});
