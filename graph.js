class Vertex{

constructor(id,x,y){

this.id=id;
this.x=x;
this.y=y;

this.vx=0;
this.vy=0;

this.fx=0;
this.fy=0;

this.radius=14;

}

}

/* =========================
EDGE
========================= */

class Edge{

constructor(v1,v2,weight){

this.v1=v1;
this.v2=v2;

this.weight=weight;

this.inMST=false;

}

}

/* =========================
GRAPH
========================= */

class Graph{

constructor(){

this.vertices=[];
this.edges=[];

this.nextVertexId=1;

this.undoStack=[];
this.redoStack=[];

this.maxHistory=100;

}

/* =========================
ADD VERTEX
========================= */

addVertex(x,y){

this.saveState();

const v=new Vertex(this.nextVertexId++,x,y);

this.vertices.push(v);

return v;

}

/* =========================
ADD EDGE
========================= */

addEdge(v1,v2,weight){

if(!v1 || !v2) return;

if(v1===v2) return;

/* prevent duplicate */

for(const e of this.edges){

if(
(e.v1===v1 && e.v2===v2) ||
(e.v1===v2 && e.v2===v1)
){
return;
}

}

this.saveState();

this.edges.push(new Edge(v1,v2,weight));

}

/* =========================
CLEAR
========================= */

clear(){

this.saveState();

this.vertices=[];
this.edges=[];

this.nextVertexId=1;

}

/* =========================
RESET MST
========================= */

resetMST(){

for(const e of this.edges){
e.inMST=false;
}

}

/* =========================
GET VERTEX AT
========================= */

getVertexAt(x,y){

for(const v of this.vertices){

const dx=v.x-x;
const dy=v.y-y;

if(Math.sqrt(dx*dx+dy*dy)<=v.radius){
return v;
}

}

return null;

}

/* =========================
UNDO / REDO
========================= */

saveState(){

const snapshot=this.serialize();

this.undoStack.push(snapshot);

if(this.undoStack.length>this.maxHistory){
this.undoStack.shift();
}

this.redoStack=[];

}

undo(){

if(this.undoStack.length===0) return;

const current=this.serialize();

this.redoStack.push(current);

const prev=this.undoStack.pop();

this.deserialize(prev);

}

redo(){

if(this.redoStack.length===0) return;

const current=this.serialize();

this.undoStack.push(current);

const next=this.redoStack.pop();

this.deserialize(next);

}

/* =========================
SERIALIZE
========================= */

serialize(){

return JSON.stringify({

vertices:this.vertices.map(v=>({

id:v.id,
x:v.x,
y:v.y

})),

edges:this.edges.map(e=>({

v1:e.v1.id,
v2:e.v2.id,
weight:e.weight

})),

nextVertexId:this.nextVertexId

});

}

/* =========================
DESERIALIZE
========================= */

deserialize(data){

const obj=typeof data==="string"
? JSON.parse(data)
: data;

this.vertices=[];
this.edges=[];

const map={};

/* load vertices */

for(const v of obj.vertices){

const vertex=new Vertex(v.id,v.x,v.y);

this.vertices.push(vertex);
map[v.id]=vertex;

}

/* load edges */

for(const e of obj.edges){

const v1=e.v1 ?? e.from ?? e[0];
const v2=e.v2 ?? e.to ?? e[1];
const w=e.weight ?? e[2] ?? 1;

if(map[v1] && map[v2]){

this.edges.push(
new Edge(map[v1],map[v2],w)
);

}

}

this.nextVertexId=obj.nextVertexId || this.vertices.length+1;

}

/* =========================
IMPORT JSON
========================= */

importJSON(data){

this.saveState();

try{

const parsed=JSON.parse(data);

this.deserialize(parsed);

}catch(e){

console.error("Import failed",e);

}

}

/* =========================
IMPORT CSV
========================= */

importCSV(text){

this.saveState();

this.clear();

const lines=text.trim().split("\n");

const map={};

for(const line of lines){

const [a,b,w]=line.split(",");

const v1=Number(a);
const v2=Number(b);
const weight=Number(w);

if(!map[v1]){

map[v1]=this.addVertex(
Math.random()*600,
Math.random()*400
);

}

if(!map[v2]){

map[v2]=this.addVertex(
Math.random()*600,
Math.random()*400
);

}

this.addEdge(map[v1],map[v2],weight);

}

}

/* =========================
EXPORT JSON (visualizer)
========================= */

exportJSON(){

return this.serialize();

}

/* =========================
EXPORT NETWORK JSON
========================= */

exportNetworkJSON(){

return JSON.stringify({

vertices:this.vertices.map(v=>({

id:v.id,
x:v.x,
y:v.y

})),

edges:this.edges.map(e=>({

from:e.v1.id,
to:e.v2.id,
weight:e.weight

}))

},null,2);

}

/* =========================
EXPORT CSV
========================= */

exportCSV(){

let csv="";

for(const e of this.edges){

csv+=`${e.v1.id},${e.v2.id},${e.weight}\n`;

}

return csv;

}

/* =========================
EXPORT EDGE LIST
========================= */

exportEdgeList(){

return JSON.stringify(

this.edges.map(e=>[
e.v1.id,
e.v2.id,
e.weight
]),

null,
2

);

}

}

/* =========================
UTILITY
========================= */

function distance(x1,y1,x2,y2){

const dx=x2-x1;
const dy=y2-y1;

return Math.sqrt(dx*dx+dy*dy);

}

window.Graph=Graph;
window.distance=distance;