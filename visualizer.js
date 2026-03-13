const canvas = document.getElementById("graph-canvas");
const ctx = canvas.getContext("2d");

/* =========================
SYSTEM
========================= */

const graph = new Graph();
const physics = new PhysicsEngine(graph);
const algorithms = new AlgorithmEngine(graph);
const playback = new PlaybackController(graph, algorithms, canvas);

/* =========================
UI ELEMENTS
========================= */

const runBtn = document.getElementById("run-btn");
const pauseBtn = document.getElementById("pause-btn");
const stepBtn = document.getElementById("step-btn");
const resetBtn = document.getElementById("reset-btn");

const addVertexBtn = document.getElementById("add-vertex-btn");
const addEdgeBtn = document.getElementById("add-edge-btn");
const clearBtn = document.getElementById("clear-btn");

const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");

const physicsBtn = document.getElementById("physics-toggle");
const speedSlider = document.getElementById("speed-slider");

const importBtn = document.getElementById("import-btn");
const exportBtn = document.getElementById("export-btn");
const gifBtn = document.getElementById("gif-btn");

const exportFormat = document.getElementById("export-format");

const fileInput = document.getElementById("file-input");

const primBtn = document.getElementById("prims-btn");
const kruskalBtn = document.getElementById("kruskals-btn");

const themeToggle = document.getElementById("theme-toggle");

/* ⭐ FIX 1: side panel algorithm label */
const algorithmLabel = document.getElementById("current-algorithm");

const modal = document.getElementById("edge-modal");
const weightInput = document.getElementById("edge-weight");
const confirmEdgeBtn = document.getElementById("confirm-edge-btn");
const closeModal = document.querySelector(".close");

/* =========================
STATE
========================= */

let mode = "vertex";
let draggingVertex = null;
let startVertex = null;
let hoverVertex = null;
let pendingEdge = null;

let currentAlgorithm = "prim";

/* =========================
CANVAS DPI FIX
========================= */

function resizeCanvas(){

const dpr = window.devicePixelRatio || 1;
const rect = canvas.getBoundingClientRect();

canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;

ctx.resetTransform();
ctx.scale(dpr,dpr);

}

window.addEventListener("resize",resizeCanvas);
resizeCanvas();

/* =========================
MOUSE POSITION
========================= */

function mousePos(e){

const rect = canvas.getBoundingClientRect();

return {
x:e.clientX-rect.left,
y:e.clientY-rect.top
};

}

/* =========================
DRAW EDGE
========================= */

function drawEdge(e){

ctx.beginPath();
ctx.moveTo(e.v1.x,e.v1.y);
ctx.lineTo(e.v2.x,e.v2.y);

ctx.strokeStyle = e.inMST ? "#26a69a" : "#888";
ctx.lineWidth = e.inMST ? 3 : 1;

ctx.stroke();

const mx = (e.v1.x + e.v2.x)/2;
const my = (e.v1.y + e.v2.y)/2;

ctx.fillStyle = getComputedStyle(document.body)
.getPropertyValue("--text");

ctx.font = "12px Montserrat";
ctx.textAlign="center";
ctx.textBaseline="middle";

ctx.fillText(e.weight,mx,my);

}

/* =========================
DRAW VERTEX
========================= */

function drawVertex(v){

ctx.beginPath();
ctx.arc(v.x,v.y,v.radius,0,Math.PI*2);

ctx.fillStyle = v===hoverVertex ? "#ffcc00" : "#7e57c2";

ctx.fill();

ctx.fillStyle="#fff";
ctx.font="12px Montserrat";

ctx.textAlign="center";
ctx.textBaseline="middle";

ctx.fillText(v.id,v.x,v.y);

}

/* =========================
RENDER LOOP
========================= */

function render(){

ctx.clearRect(0,0,canvas.width,canvas.height);

physics.update();

for(const e of graph.edges) drawEdge(e);
for(const v of graph.vertices) drawVertex(v);

requestAnimationFrame(render);

}

render();

/* =========================
MOUSE EVENTS
========================= */

canvas.addEventListener("mousedown",(e)=>{

const pos = mousePos(e);
const v = graph.getVertexAt(pos.x,pos.y);

if(mode==="vertex"){

if(!v){

graph.addVertex(pos.x,pos.y);
return;

}

draggingVertex = v;

}

if(mode==="edge" && v){

startVertex = v;

}

});

canvas.addEventListener("mousemove",(e)=>{

const pos = mousePos(e);

hoverVertex = graph.getVertexAt(pos.x,pos.y);

if(draggingVertex){

draggingVertex.x = pos.x;
draggingVertex.y = pos.y;

}

});

canvas.addEventListener("mouseup",(e)=>{

const pos = mousePos(e);
const v = graph.getVertexAt(pos.x,pos.y);

if(mode==="edge" && startVertex && v && startVertex!==v){

pendingEdge = {v1:startVertex,v2:v};

weightInput.value = 1;
modal.style.display="flex";

}

draggingVertex=null;
startVertex=null;

});

/* =========================
EDGE MODAL
========================= */

confirmEdgeBtn.onclick=()=>{

const weight = Number(weightInput.value);

if(pendingEdge){

graph.addEdge(pendingEdge.v1,pendingEdge.v2,weight);

}

modal.style.display="none";
pendingEdge=null;

};

closeModal.onclick=()=> modal.style.display="none";

/* =========================
MODE BUTTON UI FIX
========================= */

function updateModeUI(){

addVertexBtn.classList.remove("active");
addEdgeBtn.classList.remove("active");

if(mode==="vertex"){

addVertexBtn.classList.add("active");
canvas.style.cursor="crosshair";

}

if(mode==="edge"){

addEdgeBtn.classList.add("active");
canvas.style.cursor="pointer";

}

}

/* vertex mode */

addVertexBtn.onclick=()=>{

mode="vertex";
updateModeUI();

};

/* edge mode */

addEdgeBtn.onclick=()=>{

mode="edge";
updateModeUI();

};

/* initialize */

updateModeUI();

/* =========================
CLEAR
========================= */

clearBtn.onclick=()=>{

graph.clear();
playback.reset();

};

/* =========================
UNDO / REDO
========================= */

undoBtn.onclick=()=> graph.undo();
redoBtn.onclick=()=> graph.redo();

/* =========================
PHYSICS
========================= */

physicsBtn.onclick=()=>{

physics.toggle();
physicsBtn.classList.toggle("active",physics.enabled);

};

/* =========================
SPEED
========================= */

speedSlider.oninput=()=>{

playback.setSpeed(Number(speedSlider.value));

};

/* =========================
ALGORITHM
========================= */

function runAlgorithm(){

if(currentAlgorithm==="prim") algorithms.runPrim();
else algorithms.runKruskal();

playback.timelineSlider.max = algorithms.steps.length-1;

playback.updateView();

}

runBtn.onclick=()=>{
runAlgorithm();
playback.play();
};

pauseBtn.onclick=()=> playback.pause();
stepBtn.onclick=()=> playback.step();
resetBtn.onclick=()=> playback.reset();

/* =========================
ALGORITHM SELECT
========================= */

/* ⭐ FIX 2 */

primBtn.onclick=()=>{

currentAlgorithm="prim";

primBtn.classList.add("active");
kruskalBtn.classList.remove("active");

algorithmLabel.innerText="Prim's Algorithm";

};

kruskalBtn.onclick=()=>{

currentAlgorithm="kruskal";

kruskalBtn.classList.add("active");
primBtn.classList.remove("active");

algorithmLabel.innerText="Kruskal's Algorithm";

};

/* =========================
THEME TOGGLE
========================= */

themeToggle.onclick=()=>{

document.body.classList.toggle("light-mode");

};

/* =========================
EXPORT (DROPDOWN FORMAT)
========================= */

exportBtn.onclick=()=>{

const format = exportFormat.value;

let data="";
let filename="graph";

if(format==="json"){

data = graph.exportJSON();
filename += ".json";

}
else if(format==="network"){

data = graph.exportNetworkJSON();
filename += ".json";

}
else if(format==="csv"){

data = graph.exportCSV();
filename += ".csv";

}
else if(format==="edgelist"){

data = graph.exportEdgeList();
filename += ".json";

}

const blob = new Blob([data],{type:"text/plain"});
const url = URL.createObjectURL(blob);

const a = document.createElement("a");

a.href = url;
a.download = filename;

a.click();

};

/* =========================
IMPORT
========================= */

importBtn.onclick=()=> fileInput.click();

fileInput.onchange=()=>{

const file = fileInput.files[0];
if(!file) return;

const reader = new FileReader();

reader.onload=()=>{

const text = reader.result;

try{

graph.importJSON(text);

}catch{

graph.importCSV(text);

}

playback.reset();

};

reader.readAsText(file);

};

/* =========================
GIF EXPORT
========================= */

/* ⭐ FIX 3 */

gifBtn.onclick=async()=>{

gifBtn.disabled=true;
gifBtn.innerText="Rendering...";

playback.pause();
await playback.exportGIF();

gifBtn.disabled=false;
gifBtn.innerText="GIF";

};

/* =========================
TIMELINE
========================= */

playback.bindTimeline();