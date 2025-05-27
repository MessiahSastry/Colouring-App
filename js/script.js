const bgCanvas = document.getElementById('bgCanvas');
const canvas = document.getElementById('drawingCanvas');
const bgCtx = bgCanvas.getContext('2d');
const ctx = canvas.getContext('2d');

// Resize canvas to fit the window and ensure the background is redrawn
function resizeCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
  console.log("Canvas resized:", bgCanvas.width, bgCanvas.height); // Log resized canvas dimensions
  
  // Redraw the background image on canvas when resized
  if (bgImage.complete) {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height); // Clear before drawing
    bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height); // Draw image
  }
}

resizeCanvas();  // Initial resize on page load

window.addEventListener("resize", resizeCanvas);  // Redraw on resize

// Set the background image (using the full URL for testing)
const bgImage = new Image();
bgImage.src = "https://messiahsastry.github.io/Colouring-App/images/Jungle.png";  // Full URL for testing

// Check if the image is loaded correctly
bgImage.onload = function() {
  console.log("Background image loaded successfully:", bgImage.src);  // Log the loaded image source
  console.log("Canvas size:", bgCanvas.width, bgCanvas.height); // Log canvas size
  
  // Clear the canvas before drawing the new image
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height);  // Draw the image on the canvas
};

// If the image is already cached (loaded), draw it immediately
if (bgImage.complete) {
  console.log("Background image already loaded.");
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);  // Clear canvas before drawing
  bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height);  // Draw image
}

// Default drawing settings
let isDrawing = false;
let isErasing = false;
let brushColor = "#ff0000";  // Default brush color
let brushSize = 10;
let eraserSize = 10;
let history = [];
let historyStep = -1;

// Handle canvas drawing and touch events
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

// Brush and Eraser toggle functionality
document.getElementById('brushBtn').onclick = () => {
  isErasing = false;
};
document.getElementById('eraserBtn').onclick = () => {
  isErasing = true;
};

// Brush and Eraser size functionality
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
