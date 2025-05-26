
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const bgImage = document.getElementById('bgImage');
let painting = false, tool = 'brush';
let brushSize = 10, eraserSize = 10;
let color = '#000000';

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    const saved = localStorage.getItem(location.pathname);
    if (saved) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = saved;
    }
}
window.onresize = resizeCanvas;
bgImage.onload = resizeCanvas;

canvas.addEventListener('mousedown', () => painting = true);
canvas.addEventListener('mouseup', () => painting = false);
canvas.addEventListener('mousemove', draw);

function draw(e) {
    if (!painting) return;
    const x = e.clientX;
    const y = e.clientY;
    ctx.beginPath();
    ctx.arc(x, y, tool === 'brush' ? brushSize : eraserSize, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'brush' ? color : '#ffffff';
    ctx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
    ctx.fill();
}

function setTool(t) { tool = t; }
document.getElementById('brushSize').oninput = e => brushSize = e.target.value;
document.getElementById('eraserSize').oninput = e => eraserSize = e.target.value;
document.getElementById('colorPicker').oninput = e => color = e.target.value;

function toggleToolbar() {
    const bar = document.getElementById('toolbar');
    bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
}

function saveDrawing() {
    localStorage.setItem(location.pathname, canvas.toDataURL());
    alert('Drawing saved!');
}

function downloadDrawing() {
    const link = document.createElement('a');
    link.download = 'coloring.png';
    link.href = canvas.toDataURL();
    link.click();
}
