class PlaybackController{

constructor(graph,algorithmEngine,canvas){

this.graph = graph;
this.engine = algorithmEngine;
this.canvas = canvas;

this.isPlaying = false;
this.timer = null;

this.speed = 1000;

this.timelineSlider = document.getElementById("timeline-slider");
this.timelineLabel = document.getElementById("timeline-label");

}

/* =========================
PLAYBACK
========================= */

play(){

if(this.engine.steps.length===0) return;

this.isPlaying = true;

this.timer = setInterval(()=>{

if(this.engine.currentStep >= this.engine.steps.length-1){

this.pause();
return;

}

this.engine.currentStep++;

this.updateView();

},this.speed);

}

pause(){

this.isPlaying=false;

clearInterval(this.timer);

}

step(){

if(this.engine.currentStep < this.engine.steps.length-1){

this.engine.currentStep++;

this.updateView();

}

}

reset(){

this.pause();

this.engine.currentStep = 0;

this.updateView();

}

/* =========================
TIMELINE
========================= */

bindTimeline(){

this.timelineSlider.addEventListener("input",()=>{

this.engine.currentStep = Number(this.timelineSlider.value);

this.updateView();

});

}

/* =========================
UPDATE VIEW
========================= */

updateView(){

const desc = this.engine.applyStep(this.engine.currentStep);

document.getElementById("frame-description").innerText = desc;

document.getElementById("total-weight").innerText =
"Total: "+this.engine.totalWeight;

this.timelineSlider.value = this.engine.currentStep;

this.timelineLabel.innerText = this.engine.currentStep;

/* update MST edge list */

const list = document.getElementById("mst-edges");

list.innerHTML="";

for(const e of this.graph.edges){

if(e.inMST){

const li = document.createElement("li");

li.textContent =
`${e.v1.id} - ${e.v2.id} (${e.weight})`;

list.appendChild(li);

}

}

}

/* =========================
SET SPEED
========================= */

setSpeed(ms){

this.speed = ms;

if(this.isPlaying){

this.pause();
this.play();

}

}

/* =========================
WAIT FOR RENDER
========================= */

waitFrame(){

return new Promise(resolve=>{
requestAnimationFrame(()=>{
requestAnimationFrame(resolve);
});
});

}

/* =========================
EXPORT GIF
========================= */

async exportGIF(){

if(this.engine.steps.length===0) return;

/* stop playback */

this.pause();

const gif = new GIF({

workers:2,
quality:10,
workerScript:"https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js",
width:this.canvas.width,
height:this.canvas.height

});

const originalStep = this.engine.currentStep;

/* capture each step */

for(let i=0;i<this.engine.steps.length;i++){

this.engine.currentStep = i;

this.updateView();

/* ensure canvas finished rendering */

await this.waitFrame();

gif.addFrame(this.canvas,{
copy:true,
delay:this.speed
});

}

return new Promise(resolve=>{

gif.on("finished",(blob)=>{

const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = "mst-animation.gif";

document.body.appendChild(a);
a.click();
a.remove();

resolve();

});

gif.render();

});

/* restore state */

this.engine.currentStep = originalStep;

this.updateView();

}

}

/* export globally */

window.PlaybackController = PlaybackController;