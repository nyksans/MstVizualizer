class AlgorithmEngine{

constructor(graph){

this.graph = graph;

this.steps = [];
this.currentStep = 0;

this.totalWeight = 0;

}

/* =========================
RESET
========================= */

reset(){

this.steps = [];
this.currentStep = 0;
this.totalWeight = 0;

this.graph.resetMST();

}

/* =========================
STEP RECORDING
========================= */

recordStep(description){

const state = {

description,

edges:this.graph.edges.map(e=>({

v1:e.v1.id,
v2:e.v2.id,
weight:e.weight,
inMST:e.inMST

})),

totalWeight:this.totalWeight

};

this.steps.push(state);

}

/* =========================
APPLY STEP
========================= */

applyStep(index){

if(index < 0 || index >= this.steps.length) return;

const step = this.steps[index];

/* reset edges */

for(const e of this.graph.edges){
e.inMST = false;
}

/* restore step edges */

for(const savedEdge of step.edges){

const edge = this.graph.edges.find(e=>
(e.v1.id===savedEdge.v1 && e.v2.id===savedEdge.v2) ||
(e.v1.id===savedEdge.v2 && e.v2.id===savedEdge.v1)
);

if(edge){
edge.inMST = savedEdge.inMST;
}

}

this.totalWeight = step.totalWeight;

return step.description;

}

/* =========================
PRIM'S ALGORITHM
========================= */

runPrim(){

this.reset();

const vertices = this.graph.vertices;
const edges = this.graph.edges;

if(vertices.length === 0) return;

const visited = new Set();

visited.add(vertices[0]);

this.recordStep(
"Start Prim's algorithm from vertex " + vertices[0].id
);

while(visited.size < vertices.length){

let candidate = null;
let minWeight = Infinity;

for(const e of edges){

const in1 = visited.has(e.v1);
const in2 = visited.has(e.v2);

/* edge crossing cut */

if((in1 && !in2) || (!in1 && in2)){

if(e.weight < minWeight){

minWeight = e.weight;
candidate = e;

}

}

}

if(!candidate){

this.recordStep("Graph is disconnected");
break;

}

candidate.inMST = true;

this.totalWeight += candidate.weight;

/* add new vertex */

visited.add(candidate.v1);
visited.add(candidate.v2);

this.recordStep(
"Add edge (" +
candidate.v1.id + " - " +
candidate.v2.id +
") weight " + candidate.weight
);

}

this.recordStep("MST complete. Total weight = " + this.totalWeight);

}

/* =========================
KRUSKAL'S ALGORITHM
========================= */

runKruskal(){

this.reset();

/* sort edges */

const edges = [...this.graph.edges].sort(
(a,b)=>a.weight-b.weight
);

/* union find */

const parent = {};
const rank = {};

/* initialize */

for(const v of this.graph.vertices){

parent[v.id] = v.id;
rank[v.id] = 0;

}

function find(x){

if(parent[x] !== x){
parent[x] = find(parent[x]);
}

return parent[x];

}

function union(a,b){

const rootA = find(a);
const rootB = find(b);

if(rootA === rootB) return false;

/* union by rank */

if(rank[rootA] < rank[rootB]){

parent[rootA] = rootB;

}else if(rank[rootA] > rank[rootB]){

parent[rootB] = rootA;

}else{

parent[rootB] = rootA;
rank[rootA]++;

}

return true;

}

/* algorithm */

for(const e of edges){

const r1 = find(e.v1.id);
const r2 = find(e.v2.id);

if(r1 !== r2){

union(r1,r2);

e.inMST = true;

this.totalWeight += e.weight;

this.recordStep(
"Select edge (" +
e.v1.id + " - " +
e.v2.id +
") weight " + e.weight
);

}

}

this.recordStep("MST complete. Total weight = " + this.totalWeight);

}

}

/* export globally */

window.AlgorithmEngine = AlgorithmEngine;