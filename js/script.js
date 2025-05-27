const bgCanvas = document.getElementById('bgCanvas');
const canvas = document.getElementById('drawingCanvas');
const bgCtx = bgCanvas.getContext('2d');
const ctx = canvas.getContext('2d');

// Resize the canvas
function resizeCanvas() {
  bgCanvas.width = canvas.width = window.innerWidth;
  bgCanvas.height = canvas.height = window.innerHeight;
  drawBackground(); // Redraw the background when resized
}
resizeCanvas();

// Event listener for resizing
window.addEventListener("resize", () => {
  resizeCanvas();
  drawBackground();  // Redraw the background on window resize
});

let history = [];
let historyStep = -1;

// Set the background image based on the page
const bgImage = new Image();
const path = location.pathname.toLowerCase();  // Get the current page
if (path.includes("jungle")) bgImage.src = "images/Jungle.png";
else if (path.includes("dinosaur")) bgImage.src = "images/Dinosaur.png";
else if (path.includes("garden")) bgImage.src = "images/Garden.png";
else if (path.includes("farm")) bgImage.src = "images/Farm.png";
else if (path.includes("ocean")) bgImage.src = "images/Ocean.png";

// Function to draw the background image on the canvas
function drawBackground() {
  bgImage.onload = () => {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height); // Clear the canvas before drawing
    bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height); // Draw the background image
  };
  if (bgImage.complete) {
    bgCtx.drawImage(bgImage, 0, 0, bgCanvas.width, bgCanvas.height); // If the image is already loaded
  }
}

drawBackground();  // Call the function to draw the background when the page loads

