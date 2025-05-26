let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let painting = false, tool = 'brush', brushSize = 5, color = "#000";
let bgImage = document.getElementById("bgImage");

let iroPicker = new iro.ColorPicker("#colorPicker", {
  width: 150, color: "#f00"
});
iroPicker.on('color:change', function(c) {
  color = c.hexString;
});

document.getElementById('brushSize').oninput = function() {
  brushSize = this.value;
};

function setTool(t) { tool = t; }

function toggleToolbar() {
  let tools = document.getElementById("tools");
  let btn = document.getElementById("toggle-btn");
  if (tools.style.display === "none") {
    tools.style.display = "block"; btn.innerText = "⬅";
  } else {
    tools.style.display = "none"; btn.innerText = "➡";
  }
}

canvas.onmousedown = e => { painting = true; draw(e); };
canvas.onmouseup = () => { painting = false; ctx.beginPath(); };
canvas.onmousemove = draw;

function draw(e) {
  if (!painting) return;
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = tool === 'brush' ? color : "rgba(0,0,0,0)";
  if (tool === 'eraser') ctx.globalCompositeOperation = "destination-out";
  else ctx.globalCompositeOperation = "source-over";
  ctx.lineTo(e.clientX, e.clientY);
  ctx.stroke(); ctx.beginPath();
  ctx.moveTo(e.clientX, e.clientY);
}

function saveDrawing() {
  localStorage.setItem(location.pathname, canvas.toDataURL());
}

function loadDrawing() {
  let data = localStorage.getItem(location.pathname);
  if (data) {
    let img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = data;
  }
}

function downloadImage() {
  let link = document.createElement("a");
  link.download = "my_coloring.png";
  link.href = canvas.toDataURL();
  link.click();
}

window.onload = () => {
  let img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.src = bgImage.src;
  loadDrawing();
};
