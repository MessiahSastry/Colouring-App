const bgCanvas = document.getElementById('bgCanvas');
const canvas = document.getElementById('drawingCanvas');
const bgCtx = bgCanvas.getContext('2d');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let isErasing = false;
let brushColor = "#ff0000"; // Default color for the brush
let brushSize = 10;        // Default size for the brush
let eraserSize = 10;       // Default size for the eraser
let history = [];
let historyStep = -1;      // Keep track of the history for undo/redo

function resizeCanvas() {
  bgCanvas.width = canvas.width = window.innerWidth;
  bgCanvas.height = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  drawBackground();
  restoreState(historyStep); // Restore the last drawing state
});

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

// Save canvas state to history for undo/redo functionality
function saveState() {
  history = history.slice(0, historyStep + 1); // Trim the future history if we have undone actions
  history.push(canvas.toDataURL()); // Save the current canvas image
  historyStep++;
}

// Restore canvas state from history
function restoreState(index) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear current canvas
  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0); // Draw the restored state
  img.src = history[index];
}

// Brush tool
canvas.addEventListener('mousedown', e => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

// Brush/eraser drawing logic
canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  ctx.lineWidth = isErasing ? eraserSize : brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = isErasing ? "#ffffff" : brushColor;
  ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over"; // Set the right operation
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => { 
  isDrawing = false; 
  saveState(); // Save state after drawing
});

// Mobile touch support
canvas.addEventListener('touchstart', e => {
  if (e.touches.length > 1) return; // Only support single touch
  const t = e.touches[0];
  ctx.beginPath();
  ctx.moveTo(t.clientX, t.clientY);
  isDrawing = true;
});

canvas.addEventListener('touchmove', e => {
  if (e.touches.length > 1) return; // Only support single touch
  if (!isDrawing) return;
  const t = e.touches[0];
  ctx.lineWidth = isErasing ? eraserSize : brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = isErasing ? "#ffffff" : brushColor;
  ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
  ctx.lineTo(t.clientX, t.clientY);
  ctx.stroke();
  e.preventDefault(); // Prevent scrolling while drawing
});

canvas.addEventListener('touchend', () => { 
  if (!isDrawing) return;
  isDrawing = false; 
  saveState(); // Save state after drawing
});

// Brush button functionality
document.getElementById('brushBtn').onclick = () => {
  isErasing = false;  // Set to brush mode
};

// Eraser button functionality
document.getElementById('eraserBtn').onclick = () => {
  isErasing = true;   // Set to eraser mode
};

// Color Picker functionality
document.getElementById('colorPicker').oninput = e => {
  brushColor = e.target.value;  // Update the brush color when the user selects a color
};

// Brush size control functionality
document.getElementById('brushSize').oninput = e => {
  brushSize = e.target.value;  // Update the brush size
};

// Eraser size control functionality
document.getElementById('eraserSize').oninput = e => {
  eraserSize = e.target.value; // Update the eraser size
};

// Save functionality
document.getElementById('saveBtn').onclick = () => {
  console.log('Save Button Clicked');
  localStorage.setItem(location.pathname, canvas.toDataURL());  // Save the canvas to localStorage
};

// Load functionality
document.getElementById('loadBtn').onclick = () => {
  console.log('Load Button Clicked');
  let data = localStorage.getItem(location.pathname);
  if (data) {
    let img = new Image();
    img.src = data;
    img.onload = () => ctx.drawImage(img, 0, 0);  // Draw the saved state on the canvas
  }
};

// Download functionality
document.getElementById('downloadBtn').onclick = () => {
  console.log('Download Button Clicked');
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL();  // Download the canvas image
  link.click();
};

// Undo functionality
document.getElementById('undoBtn').onclick = () => {
  console.log('Undo Button Clicked');
  if (historyStep > 0) { 
    historyStep--; 
    restoreState(historyStep);  // Restore previous state
  }
};

// Redo functionality
document.getElementById('redoBtn').onclick = () => {
  console.log('Redo Button Clicked');
  if (historyStep < history.length - 1) { 
    historyStep++; 
    restoreState(historyStep);  // Restore the next state
  }
};

// Upload functionality
document.getElementById('uploadBtn').onclick = () => {
  console.log('Upload Button Clicked');
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
          bgCtx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);  // Upload the image onto the canvas
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file); // Read the file
    }
  };
  input.click();  // Trigger the file picker
};

// Music Toggle functionality
document.getElementById('musicToggle').onclick = () => {
  console.log('Music Toggle Button Clicked');
  const music = document.getElementById('bgMusic');
  music.muted = false;
  if (music.paused) music.play(); else music.pause();  // Toggle music play/pause
};

// Toolbar toggle functionality
document.getElementById('toggleToolbar').onclick = () => {
  console.log('Toolbar Toggle Button Clicked');
  document.getElementById('toolbar').classList.toggle('hide');  // Hide or show toolbar
};

// Fullscreen functionality
document.getElementById('fullscreenBtn').onclick = function() {
  console.log('Fullscreen Button Clicked');
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

window.onload = () => saveState();  // Save the initial state of the canvas when page loads
