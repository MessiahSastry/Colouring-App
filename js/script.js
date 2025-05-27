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

// --------- Pinch-to-Zoom and Pan State ---------
let scale = 1, panX = 0, panY = 0;
let lastScale = 1, lastPan = [0,0];
let pinchStart = null;
let pinchMode = false;

// --- Helper: set canvas sizes ---
function resizeCanvas() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  bgCanvas.width = canvas.width = w;
  bgCanvas.height = canvas.height = h;
  drawAll();
}
window.addEventListener('resize', resizeCanvas);

// --------- Pinch/Zoom/Pan Drawing Helpers ----------
function drawAll() {
  // Draw outline on bgCanvas
  bgCtx.setTransform(1,0,0,1,0,0);
  bgCtx.clearRect(0,0,bgCanvas.width,bgCanvas.height);
  bgCtx.save();
  bgCtx.translate(panX, panY);
  bgCtx.scale(scale, scale);
  if (currentBgDataURL) {
    let img = new Image();
    img.onload = () => bgCtx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);
    img.src = currentBgDataURL;
  } else if (bgImage.src && (scene || bgImage.complete)) {
    bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height);
  }
  bgCtx.restore();

  // Draw user's drawing on drawingCanvas
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(scale, scale);
  if (historyStep >= 0 && history[historyStep]) {
    let img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = history[historyStep];
  }
  ctx.restore();
}

// --------- Pinch/Zoom/Pan Handlers -----------
function distance(t1, t2) {
  let dx = t2.clientX - t1.clientX, dy = t2.clientY - t1.clientY;
  return Math.sqrt(dx*dx + dy*dy);
}
function midpoint(t1, t2) {
  return {x: (t1.clientX+t2.clientX)/2, y: (t1.clientY+t2.clientY)/2};
}

canvas.addEventListener('touchstart', function(e) {
  if (e.touches.length === 2) {
    pinchMode = true;
    pinchStart = {
      distance: distance(e.touches[0], e.touches[1]),
      midpoint: midpoint(e.touches[0], e.touches[1])
    };
    lastScale = scale;
    lastPan = [panX, panY];
  } else if (e.touches.length === 1 && !pinchMode) {
    startDraw(e);
  }
}, {passive:false});

canvas.addEventListener('touchmove', function(e) {
  if (e.touches.length === 2 && pinchMode) {
    e.preventDefault();
    let newDist = distance(e.touches[0], e.touches[1]);
    let mp = midpoint(e.touches[0], e.touches[1]);
    // Scale
    let newScale = Math.min(3, Math.max(1, lastScale * (newDist / pinchStart.distance)));
    // Pan
    let dx = mp.x - pinchStart.midpoint.x;
    let dy = mp.y - pinchStart.midpoint.y;
    scale = newScale;
    panX = lastPan[0] + dx;
    panY = lastPan[1] + dy;
    drawAll();
  } else if (e.touches.length === 1 && !pinchMode) {
    draw(e);
  }
}, {passive:false});

canvas.addEventListener('touchend', function(e) {
  if (e.touches.length === 0) {
    pinchMode = false;
    endDraw(e);
  }
}, {passive:false});

// --- Mouse for desktop panning/zooming (optional, scroll to zoom) ---
canvas.addEventListener('wheel', function(e){
  e.preventDefault();
  let scaleAmount = e.deltaY < 0 ? 1.1 : 0.9;
  let newScale = Math.min(3, Math.max(1, scale * scaleAmount));
  let mx = e.offsetX, my = e.offsetY;
  panX = mx - (mx - panX) * (newScale/scale);
  panY = my - (my - panY) * (newScale/scale);
  scale = newScale;
  drawAll();
});
canvas.addEventListener('mousedown', function(e){
  if (e.button === 1) { // Middle mouse button pans
    canvas.style.cursor = "grabbing";
    let startX = e.clientX, startY = e.clientY, startPanX = panX, startPanY = panY;
    function mm(ev){
      panX = startPanX + (ev.clientX - startX);
      panY = startPanY + (ev.clientY - startY);
      drawAll();
    }
    function mu(){
      document.removeEventListener('mousemove', mm);
      document.removeEventListener('mouseup', mu);
      canvas.style.cursor = "default";
    }
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
  }
});

// --------- Background image and scene logic -----------
const bgImage = new Image();
let scene = null;

if (location.pathname.toLowerCase().includes("jungle")) { bgImage.src = "images/Jungle.png"; scene = "jungle"; }
else if (location.pathname.toLowerCase().includes("dinosaur")) { bgImage.src = "images/Dinosaur.png"; scene = "dinosaur"; }
else if (location.pathname.toLowerCase().includes("garden")) { bgImage.src = "images/Garden.png"; scene = "garden"; }
else if (location.pathname.toLowerCase().includes("farm")) { bgImage.src = "images/Farm.png"; scene = "farm"; }
else if (location.pathname.toLowerCase().includes("ocean")) { bgImage.src = "images/Ocean.png"; scene = "ocean"; }

bgImage.onload = drawAll;

// --- Color Picker (iro.js) ---
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

if (brushBtn) brushBtn.onclick = () => { isErasing = false; };
if (eraserBtn) eraserBtn.onclick = () => { isErasing = true; };
if (brushSizeSlider) brushSizeSlider.oninput = e => brushSize = parseInt(e.target.value);
if (eraserSizeSlider) eraserSizeSlider.oninput = e => eraserSize = parseInt(e.target.value);

// ----------- Drawing Logic (with scaling/panning support) -----------
function getXY(e) {
  let rect = canvas.getBoundingClientRect();
  let x, y;
  if (e.touches && e.touches.length === 1) {
    x = e.touches[0].clientX - rect.left;
    y = e.touches[0].clientY - rect.top;
  } else if (e.clientX !== undefined) {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
  }
  // Map screen point to drawing coordinates
  x = (x - panX) / scale;
  y = (y - panY) / scale;
  return [x, y];
}

function startDraw(e) {
  if (pinchMode) return;
  isDrawing = true;
  [lastX, lastY] = getXY(e);
  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.restore();
  canvas.addEventListener('mousemove', draw);
}
function endDraw(e) {
  if (isDrawing) {
    isDrawing = false;
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);
    ctx.closePath();
    ctx.restore();
    saveState();
  }
  canvas.removeEventListener('mousemove', draw);
}
function draw(e) {
  if (!isDrawing || pinchMode) return;
  e.preventDefault && e.preventDefault();
  let [x, y] = getXY(e);
  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (isErasing) {
    ctx.globalCompositeOperation = "destination-out"; // Erase only drawing, not outline
    ctx.strokeStyle = "rgba(0,0,0,1)";
    ctx.lineWidth = eraserSize;
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
  }
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.restore();

  [lastX, lastY] = [x, y];
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseout', endDraw);

// --------- Undo/Redo/Save/Load/Download ---------
function saveState() {
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  let data = canvas.toDataURL();
  ctx.restore();
  history = history.slice(0, historyStep + 1);
  history.push(data);
  historyStep++;
}
function restoreState(index) {
  drawAll();
  if (history[index]) {
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);
    let img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    img.src = history[index];
    ctx.restore();
  }
}

if (undoBtn) undoBtn.onclick = () => {
  if (historyStep > 0) { historyStep--; restoreState(historyStep);}
};
if (redoBtn) redoBtn.onclick = () => {
  if (historyStep < history.length - 1) { historyStep++; restoreState(historyStep);}
};
if (saveBtn) saveBtn.onclick = () => { localStorage.setItem(location.pathname, canvas.toDataURL()); };
if (loadBtn) loadBtn.onclick = () => {
  let data = localStorage.getItem(location.pathname);
  if (data) {
    let img = new Image();
    img.src = data;
    img.onload = () => {
      ctx.save();
      ctx.translate(panX, panY);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }
};
if (downloadBtn) downloadBtn.onclick = () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  link.href = canvas.toDataURL();
  ctx.restore();
  link.click();
};

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
        drawAll();
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
};

if (musicToggle) musicToggle.onclick = () => {
  const music = document.getElementById('bgMusic');
  if (!music) return;
  music.muted = false;
  if (music.paused) music.play(); else music.pause();
};

if (toolbarToggle) toolbarToggle.onclick = () => {
  document.getElementById('toolbar').classList.toggle('hide');
};

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
  drawAll();
};

// --- Special: For Upload Page, show uploaded image as outline bg ---
if (location.pathname.toLowerCase().includes("upload")) {
  currentBgDataURL = null;
}
