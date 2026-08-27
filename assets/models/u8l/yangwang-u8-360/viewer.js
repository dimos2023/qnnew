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

function pointerDown(event) {
  stopAuto();
  dragging = true;
  startX = event.clientX;
  startFrame = frame;
  stage.setPointerCapture?.(event.pointerId);
}

function pointerMove(event) {
  if (!dragging) return;
  const delta = Math.round((event.clientX - startX) / 18);
  frame = ((startFrame - delta) % frameCount + frameCount) % frameCount;
  render();
}

function pointerUp() { dragging = false; }

stage.addEventListener('pointerdown', pointerDown);
stage.addEventListener('pointermove', pointerMove);
stage.addEventListener('pointerup', pointerUp);
stage.addEventListener('pointercancel', pointerUp);
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
