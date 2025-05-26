let canvas, ctx, drawing = false;
let brushSize = 5, erasing = false, scale = 1;

window.onload = () => {
  canvas = document.getElementById("drawingCanvas");
  ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth - 40;
  canvas.height = window.innerHeight - 200;

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", endDraw);
  canvas.addEventListener("mouseout", endDraw);

  document.getElementById("brushSize").addEventListener("input", e => brushSize = e.target.value);
  document.getElementById("eraserToggle").addEventListener("click", () => {
    erasing = !erasing;
    document.getElementById("eraserToggle").textContent = erasing ? "Brush" : "Eraser";
  });

  document.getElementById("saveBtn").addEventListener("click", saveDrawing);
  document.getElementById("loadBtn").addEventListener("click", loadDrawing);
  document.getElementById("downloadBtn").addEventListener("click", downloadImage);
  document.getElementById("toggleToolbar").addEventListener("click", () => {
    document.querySelector(".toolbar").classList.toggle("hidden");
  });

  let colorPicker = new iro.ColorPicker("#colorPicker", { width: 150, color: "#f00" });
  colorPicker.on("color:change", color => ctx.strokeStyle = color.hexString);

  ctx.lineCap = "round";
  ctx.strokeStyle = "#f00";

  document.getElementById("music").play();
};

function startDraw(e) {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = brushSize;
  ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function endDraw() {
  drawing = false;
  ctx.closePath();
}

function saveDrawing() {
  localStorage.setItem("drawing", canvas.toDataURL());
  alert("Drawing saved!");
}

function loadDrawing() {
  let data = localStorage.getItem("drawing");
  if (data) {
    let img = new Image();
    img.src = data;
    img.onload = () => ctx.drawImage(img, 0, 0);
  }
}

function downloadImage() {
  let link = document.createElement("a");
  link.download = "coloring.png";
  link.href = canvas.toDataURL();
  link.click();
}
