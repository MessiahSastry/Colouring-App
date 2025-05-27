const bgCanvas = document.getElementById('bgCanvas');
const canvas = document.getElementById('drawingCanvas');
const bgCtx = bgCanvas.getContext('2d');
const ctx = canvas.getContext('2d');

// Resize the canvas to fit the window
function resizeCanvas() {
  bgCanvas.width = canvas.width = window.innerWidth;
  bgCanvas.height = canvas.height = window.innerHeight;
  drawBackground();  // Redraw the background whenever resized
}
resizeCanvas();

// Event listener for window resizing
window.addEventListener("resize", () => {
  resizeCanvas();
  drawBackground();  // Redraw the background after resizing
});

// Default settings for history
let history = [];
let historyStep = -1;

// Set the background image based on the current page URL
const bgImage = new Image();
const path = location.pathname.toLowerCase();  // Get the current page
if (path.includes("jungle")) bgImage.src = "images/Jungle.png";
else if (path.includes("dinosaur")) bgImage.src = "images/Dinosaur.png";
else if (path.includes("garden")) bgImage.src = "images/Garden.png";
else if (path.includes("farm")) bgImage.src = "images/Farm.png";
else if (path.includes("ocean")) bgImage.src = "images/Ocean.png";

// Debug: Check the image path and ensure it loads correctly
bgImage.onload = function() {
  console.log("Background image loaded successfully:", bgImage.src);  // Log the loaded image source
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);  // Clear the canvas before drawing the new image
  bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height);  // Draw the image onto the canvas
};

// Draw background image if already loaded
if (bgImage.complete) {
  bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height);  // Draw the image
} else {
  console.log("Background image not loaded yet");
}

// Handle canvas state management (for drawing)
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

// Add mouse and touch events for drawing
canvas.addEventListener('mousedown', e => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = brushColor;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});
canvas.addEventListener('mouseup', () => { isDrawing = false; saveState(); });

// Add touch events for mobile devices
canvas.addEventListener('touchstart', e => {
  if (e.touches.length > 1) return;  // Prevent multi-touch
  const t = e.touches[0];
  ctx.beginPath();
  ctx.moveTo(t.clientX, t.clientY);
  isDrawing = true;
});
canvas.addEventListener('touchmove', e => {
  if (e.touches.length > 1) return;
  if (!isDrawing) return;
  const t = e.touches[0];
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = brushColor;
  ctx.lineTo(t.clientX, t.clientY);
  ctx.stroke();
  e.preventDefault();
});
canvas.addEventListener('touchend', () => { if (isDrawing) { isDrawing = false; saveState(); } });

// Initialize brush and eraser toggle
document.getElementById('brushBtn').onclick = () => { isErasing = false; };
document.getElementById('eraserBtn').onclick = () => { isErasing = true; };

// Handle color picker and size inputs
const colorPicker = new iro.ColorPicker("#colorPickerWheel", {
  width: 100,
  color: brushColor
});
colorPicker.on("color:change", function(color) {
  brushColor = color.hexString;  // Update brush color when the color is changed
});

// Handle brush size
document.getElementById('brushSize').oninput = e => brushSize = e.target.value;
document.getElementById('eraserSize').oninput = e => eraserSize = e.target.value;

// Save and load functions for canvas state
document.getElementById('saveBtn').onclick = () => { localStorage.setItem(location.pathname, canvas.toDataURL()); };
document.getElementById('loadBtn').onclick = () => {
  let data = localStorage.getItem(location.pathname);
  if (data) {
    let img = new Image();
    img.src = data;
    img.onload = () => ctx.drawImage(img, 0, 0);
  }
};

// Download the canvas content as a PNG file
document.getElementById('downloadBtn').onclick = () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL();
  link.click();
};

// Undo and Redo functions
document.getElementById('undoBtn').onclick = () => { if (historyStep > 0) { historyStep--; restoreState(historyStep); } };
document.getElementById('redoBtn').onclick = () => { if (historyStep < history.length - 1) { historyStep++; restoreState(historyStep); } };

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

// Music toggle functionality
document.getElementById('musicToggle').onclick = () => {
  const music = document.getElementById('bgMusic');
  music.muted = false;
  if (music.paused) music.play(); else music.pause();
};

// Toggle toolbar visibility
document.getElementById('toggleToolbar').onclick = () => {
  document.getElementById('toolbar').classList.toggle('hide');
};

// Fullscreen functionality
document.getElementById('fullscreenBtn').onclick = function() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// Initialize page state
window.onload = () => saveState();
