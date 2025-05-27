// js/script.js

// ---- DOM elements ----
const bgCanvas = document.getElementById('bgCanvas');
const canvas = document.getElementById('drawingCanvas');
const bgCtx = bgCanvas.getContext('2d');
const ctx = canvas.getContext('2d');

let brushColor = "#ff0000";
let brushSize = 10;
let eraserSize = 10;
let isDrawing = false;
let isErasing = false;
let lastX = 0, lastY = 0;
let history = [];
let historyStep = -1;
let currentBgDataURL = null;

// --- Helper: set canvas sizes ---
function resizeCanvas() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  bgCanvas.width = canvas.width = w;
  bgCanvas.height = canvas.height = h;
  drawBackgroundImage();
  if (historyStep >= 0) restoreState(historyStep);
}
window.addEventListener('resize', resizeCanvas);

// --- Background image setup ---
const bgImage = new Image();
let scene = null;

// Determine scene from pathname
if (location.pathname.toLowerCase().includes("jungle")) { bgImage.src = "images/Jungle.png"; scene = "jungle"; }
else if (location.pathname.toLowerCase().includes("dinosaur")) { bgImage.src = "images/Dinosaur.png"; scene = "dinosaur"; }
else if (location.pathname.toLowerCase().includes("garden")) { bgImage.src = "images/Garden.png"; scene = "garden"; }
else if (location.pathname.toLowerCase().includes("farm")) { bgImage.src = "images/Farm.png"; scene = "farm"; }
else if (location.pathname.toLowerCase().includes("ocean")) { bgImage.src = "images/Ocean.png"; scene = "ocean"; }

// Draws background (scene image or uploaded)
function drawBackgroundImage() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  if (currentBgDataURL) {
    let img = new Image();
    img.onload = () => bgCtx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);
    img.src = currentBgDataURL;
  } else if (bgImage.src && (scene || bgImage.complete)) {
    bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height);
  }
}

// When background image loads, redraw
bgImage.onload = function() {
  drawBackgroundImage();
};

// --- Set up iro.js color picker (only if wheel exists) ---
if (document.getElementById('colorPickerWheel')) {
  let colorPicker = new iro.ColorPicker("#colorPickerWheel", {
    width: 100,
    color: brushColor
  });
  colorPicker.on("color:change", function(color) {
    brushColor = color.hexString;
  });
}

// --- Toolbar buttons ---
const brushBtn = document.getElementById('brushBtn');
const eraserBtn = document.getElementById('eraserBtn');
const brushSizeSlider = document.getElementById('brushSize');
const eraserSizeSlider = document.getElementById('eraserSize');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const downloadBtn = document.getElementById('downloadBtn');
const uploadBtn = document.getElementById('uploadBtn');
const musicToggle = document.getElementById('musicToggle');
const toolbarToggle = document.getElementById('toggleToolbar');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// ---- Toolbar logic ----
if (brushBtn) brushBtn.onclick = () => { isErasing = false; };
if (eraserBtn) eraserBtn.onclick = () => { isErasing = true; };
if (brushSizeSlider) brushSizeSlider.oninput = e => brushSize = parseInt(e.target.value);
if (eraserSizeSlider) eraserSizeSlider.oninput = e => eraserSize = parseInt(e.target.value);

// --- Drawing logic ---
function getXY(e) {
  let rect = canvas.getBoundingClientRect();
  let x, y;
  if (e.touches) {
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
  } else {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  return [x, y];
}

function startDraw(e) {
  isDrawing = true;
  [lastX, lastY] = getXY(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('touchmove', draw, {passive:false});
}

function endDraw(e) {
  if (isDrawing) {
    isDrawing = false;
    ctx.closePath();
    saveState();
  }
  canvas.removeEventListener('mousemove', draw);
  canvas.removeEventListener('touchmove', draw);
}

function draw(e) {
  if (!isDrawing) return;
  e.preventDefault && e.preventDefault();
  let [x, y] = getXY(e);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = isErasing ? "#fff" : brushColor;
  ctx.lineWidth = isErasing ? eraserSize : brushSize;
  ctx.lineTo(x, y);
  ctx.stroke();
  [lastX, lastY] = [x, y];
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseout', endDraw);
canvas.addEventListener('touchstart', function(e) {startDraw(e);}, {passive:false});
canvas.addEventListener('touchend', endDraw);
canvas.addEventListener('touchcancel', endDraw);

// ---- History (Undo/Redo) ----
function saveState() {
  history = history.slice(0, historyStep + 1);
  history.push(canvas.toDataURL());
  historyStep++;
}

function restoreState(index) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (history[index]) {
    let img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = history[index];
  }
}

if (undoBtn) undoBtn.onclick = () => {
  if (historyStep > 0) { historyStep--; restoreState(historyStep);}
};
if (redoBtn) redoBtn.onclick = () => {
  if (historyStep < history.length - 1) { historyStep++; restoreState(historyStep);}
};

// ---- Save/Load/Download ----
if (saveBtn) saveBtn.onclick = () => { localStorage.setItem(location.pathname, canvas.toDataURL()); };
if (loadBtn) loadBtn.onclick = () => {
  let data = localStorage.getItem(location.pathname);
  if (data) {
    let img = new Image();
    img.src = data;
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
};
if (downloadBtn) downloadBtn.onclick = () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL();
  link.click();
};

// ---- Upload Outline Image ----
if (uploadBtn) uploadBtn.onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        currentBgDataURL = e.target.result;
        drawBackgroundImage();
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
};

// ---- Music toggle ----
if (musicToggle) musicToggle.onclick = () => {
  const music = document.getElementById('bgMusic');
  if (!music) return;
  music.muted = false;
  if (music.paused) music.play(); else music.pause();
  // Optionally: Change button style to show play/pause state
};

// ---- Toolbar toggle ----
if (toolbarToggle) toolbarToggle.onclick = () => {
  document.getElementById('toolbar').classList.toggle('hide');
};

// ---- Fullscreen ----
if (fullscreenBtn) fullscreenBtn.onclick = function() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// ---- INITIALIZATION ----
window.onload = () => {
  resizeCanvas();
  saveState();
};

// --- Special: For Upload Page, show uploaded image as outline bg ---
if (location.pathname.toLowerCase().includes("upload")) {
  // No default scene image; only user-uploaded
  currentBgDataURL = null;
}

