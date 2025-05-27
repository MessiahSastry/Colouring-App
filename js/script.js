const bgCanvas = document.getElementById('bgCanvas');
const canvas = document.getElementById('drawingCanvas');
const bgCtx = bgCanvas.getContext('2d');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  bgCanvas.width = canvas.width = window.innerWidth;
  bgCanvas.height = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  drawBackground();
  restoreState(historyStep);
});

let isDrawing = false;
let isErasing = false;
let brushColor = "#ff0000"; // Default color is red
let brushSize = 10;
let eraserSize = 10;
let history = [];
let historyStep = -1;

const bgImage = new Image();
const path = location.pathname.toLowerCase();
if (path.includes("jungle")) bgImage.src = "images/Jungle.png";
else if (path.includes("dinosaur")) bgImage.src = "images/Dinosaur.png";
else if (path.includes("garden")) bgImage.src = "images/Garden.png";
else if (path.includes("farm")) bgImage.src = "images/Farm.png";
else if (path.includes("ocean")) bgImage.src = "images/Ocean.png";

function drawBackground() {
  bgImage.onload = () => {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height);
  };
  if (bgImage.complete) {
    bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height);
  }
}
drawBackground();

function saveState() {
  history = history.slice(0, historyStep + 1);
  history.push(canvas.toDataURL());
  historyStep++;
}
function restoreState(index) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0);
  img.src = history[index];
}

canvas.addEventListener('mousedown', e => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  ctx.lineWidth = isErasing ? eraserSize : brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = brushColor;  // Using brushColor here
  ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});
canvas.addEventListener('mouseup', () => { isDrawing = false; saveState(); });

canvas.addEventListener('touchstart', e => {
  if (e.touches.length > 1) return;
  const t = e.touches[0];
  ctx.beginPath();
  ctx.moveTo(t.clientX, t.clientY);
  isDrawing = true;
});
canvas.addEventListener('touchmove', e => {
  if (e.touches.length > 1) return;
  if (!isDrawing) return;
  const t = e.touches[0];
  ctx.lineWidth = isErasing ? eraserSize : brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = isErasing ? "#ffffff" : brushColor; // Brush color for mobile
  ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
  ctx.lineTo(t.clientX, t.clientY);
  ctx.stroke();
  e.preventDefault();
});
canvas.addEventListener('touchend', () => {
  if (!isDrawing) return;
  isDrawing = false;
  saveState();
});

// Brush and Eraser toggle functionality
document.getElementById('brushBtn').onclick = () => {
  isErasing = false;
};
document.getElementById('eraserBtn').onclick = () => {
  isErasing = true;
};

// Color picker functionality
var colorPicker = new iro.ColorPicker("#colorPickerWheel", {
  width: 100,
  color: brushColor
});
colorPicker.on("color:change", function(color) {
  brushColor = color.hexString;  // Update brush color when color is changed
});

// Brush and Eraser size functionality
document.getElementById('brushSize').oninput = e => brushSize = e.target.value;
document.getElementById('eraserSize').oninput = e => eraserSize = e.target.value;

// Save functionality
document.getElementById('saveBtn').onclick = () => {
  localStorage.setItem(location.pathname, canvas.toDataURL());
};

// Load functionality
document.getElementById('loadBtn').onclick = () => {
  let data = localStorage.getItem(location.pathname);
  if (data) {
    let img = new Image();
    img.src = data;
    img.onload = () => ctx.drawImage(img, 0, 0);
  }
};

// Download functionality
document.getElementById('downloadBtn').onclick = () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL();
  link.click();
};

// Undo functionality
document.getElementById('undoBtn').onclick = () => {
  if (historyStep > 0) { historyStep--; restoreState(historyStep); }
};

// Redo functionality
document.getElementById('redoBtn').onclick = () => {
  if (historyStep < history.length - 1) { historyStep++; restoreState(historyStep); }
};

// Upload image functionality
document.getElementById('uploadBtn').onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
          bgCtx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
};

// Music Toggle functionality
document.getElementById('musicToggle').onclick = () => {
  const music = document.getElementById('bgMusic');
  music.muted = false;
  if (music.paused) music.play(); else music.pause();
};

// Toggle toolbar visibility
document.getElementById('toggleToolbar').onclick = () => {
  document.getElementById('toolbar').classList.toggle('hide');
};

// Fullscreen toggle functionality
document.getElementById('fullscreenBtn').onclick = function() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

window.onload = () => saveState();
