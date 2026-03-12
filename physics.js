class PhysicsEngine{

constructor(graph){

this.graph = graph;

this.enabled = false;

/* physics constants */

this.repulsion = 4500;
this.springLength = 110;
this.springStrength = 0.008;

this.damping = 0.88;
this.maxVelocity = 5;

/* stabilization */

this.stabilityThreshold = 0.08;
this.stableFrames = 0;
this.requiredStableFrames = 150;

}

/* =========================
TOGGLE
========================= */

toggle(){

this.enabled = !this.enabled;
this.stableFrames = 0;

}

/* =========================
UPDATE PHYSICS
========================= */

update(){

if(!this.enabled) return;

const vertices = this.graph.vertices;
const edges = this.graph.edges;

if(vertices.length===0) return;

let totalMovement = 0;

/* reset forces */

for(const v of vertices){

v.fx = 0;
v.fy = 0;

}

/* =========================
REPULSION FORCE
========================= */

for(let i=0;i<vertices.length;i++){

for(let j=i+1;j<vertices.length;j++){

const v1 = vertices[i];
const v2 = vertices[j];

let dx = v2.x - v1.x;
let dy = v2.y - v1.y;

let dist = Math.sqrt(dx*dx + dy*dy);

/* avoid zero distance */

if(dist < 0.01) dist = 0.01;

let force = this.repulsion / (dist * dist);

let fx = force * dx / dist;
let fy = force * dy / dist;

v1.fx -= fx;
v1.fy -= fy;

v2.fx += fx;
v2.fy += fy;

}

}

/* =========================
SPRING FORCE
========================= */

for(const e of edges){

const v1 = e.v1;
const v2 = e.v2;

let dx = v2.x - v1.x;
let dy = v2.y - v1.y;

let dist = Math.sqrt(dx*dx + dy*dy);

if(dist < 0.01) dist = 0.01;

let displacement = dist - this.springLength;

let force = this.springStrength * displacement;

let fx = force * dx / dist;
let fy = force * dy / dist;

v1.fx += fx;
v1.fy += fy;

v2.fx -= fx;
v2.fy -= fy;

}

/* =========================
APPLY VELOCITY
========================= */

for(const v of vertices){

v.vx = (v.vx + v.fx) * this.damping;
v.vy = (v.vy + v.fy) * this.damping;

let speed = Math.sqrt(v.vx*v.vx + v.vy*v.vy);

/* clamp velocity */

if(speed > this.maxVelocity){

v.vx *= this.maxVelocity / speed;
v.vy *= this.maxVelocity / speed;

}

v.x += v.vx;
v.y += v.vy;

totalMovement += Math.abs(v.vx) + Math.abs(v.vy);

}

/* =========================
AUTO STABILIZATION
========================= */

if(totalMovement < this.stabilityThreshold){

this.stableFrames++;

}else{

this.stableFrames = 0;

}

/* stop physics when stable */

if(this.stableFrames > this.requiredStableFrames){

this.enabled = false;

}

}

}

/* export globally */

window.PhysicsEngine = PhysicsEngine;