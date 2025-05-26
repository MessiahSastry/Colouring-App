const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;
let isErasing = false;
let brushColor = document.getElementById('colorPicker').value;
let brushSize = document.getElementById('brushSize').value;
let history = [];
let historyStep = -1;

function saveState() {
  history = history.slice(0, historyStep + 1);
  history.push(canvas.toDataURL());
  historyStep++;
}

function restoreState(index) {
  let img = new Image();
  img.src = history[index];
  img.onload = () => ctx.drawImage(img, 0, 0);
}

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = isErasing ? "#ffffff" : brushColor;
  ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
  saveState();
});

canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  ctx.beginPath();
  ctx.moveTo(t.clientX, t.clientY);
  isDrawing = true;
});

canvas.addEventListener('touchmove', (e) => {
  if (!isDrawing) return;
  const t = e.touches[0];
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = isErasing ? "#ffffff" : brushColor;
  ctx.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
  ctx.lineTo(t.clientX, t.clientY);
  ctx.stroke();
  e.preventDefault();
});

canvas.addEventListener('touchend', () => {
  isDrawing = false;
  saveState();
});

document.getElementById('brushBtn').onclick = () => isErasing = false;
document.getElementById('eraserBtn').onclick = () => isErasing = true;
document.getElementById('colorPicker').oninput = e => brushColor = e.target.value;
document.getElementById('brushSize').oninput = e => brushSize = e.target.value;

document.getElementById('saveBtn').onclick = () => {
  localStorage.setItem(location.pathname, canvas.toDataURL());
};

document.getElementById('loadBtn').onclick = () => {
  let data = localStorage.getItem(location.pathname);
  if (data) {
    let img = new Image();
    img.src = data;
    img.onload = () => ctx.drawImage(img, 0, 0);
  }
};

document.getElementById('downloadBtn').onclick = () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.toDataURL();
  link.click();
};

document.getElementById('undoBtn').onclick = () => {
  if (historyStep > 0) {
    historyStep--;
    restoreState(historyStep);
  }
};

document.getElementById('redoBtn').onclick = () => {
  if (historyStep < history.length - 1) {
    historyStep++;
    restoreState(historyStep);
  }
};

document.getElementById('musicToggle').onclick = () => {
  const music = document.getElementById('bgMusic');
  if (music.paused) music.play();
  else music.pause();
};

document.getElementById('toggleToolbar').onclick = () => {
  document.getElementById('toolbar').classList.toggle('hide');
};

window.onload = () => saveState();

const uploadInput = document.createElement('input');
uploadInput.type = 'file';
uploadInput.accept = 'image/*';
uploadInput.style.display = 'none';
document.body.appendChild(uploadInput);

document.getElementById('uploadBtn').onclick = () => uploadInput.click();

uploadInput.onchange = () => {
  const file = uploadInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveState();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};
