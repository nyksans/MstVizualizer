/**
 * MST Algorithm Visualizer
 */

// DOM Elements
const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');
const addVertexBtn = document.getElementById('add-vertex-btn');
const addEdgeBtn = document.getElementById('add-edge-btn');
const clearBtn = document.getElementById('clear-btn');
const runBtn = document.getElementById('run-btn');
const stepBtn = document.getElementById('step-btn');
const resetBtn = document.getElementById('reset-btn');
const primsBtn = document.getElementById('prims-btn');
const kruskalsBtn = document.getElementById('kruskals-btn');
const currentAlgorithmEl = document.getElementById('current-algorithm');
const algorithmDescriptionEl = document.getElementById('algorithm-description');
const stepDescriptionEl = document.getElementById('step-description');
const mstEdgesEl = document.getElementById('mst-edges');
const totalWeightEl = document.getElementById('total-weight');
const edgeModal = document.getElementById('edge-modal');
const closeModalBtn = document.querySelector('.close');
const fromVertexSelect = document.getElementById('from-vertex');
const toVertexSelect = document.getElementById('to-vertex');
const edgeWeightInput = document.getElementById('edge-weight');
const confirmEdgeBtn = document.getElementById('confirm-edge-btn');

// Constants
const VERTEX_RADIUS = 20;
const EDGE_WIDTH = 3;
const VERTEX_FONT = '16px Arial';
const EDGE_FONT = '14px Arial';
const ANIMATION_SPEED = 1000; // ms

// State
const graph = new Graph();
let algorithm = new PrimsAlgorithm(graph);
let isAddingVertex = false;
let isAddingEdge = false;
let selectedVertex = null;
let animationTimeout = null;
let isRunning = false;

// Initialize canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    render();
}

// Render the graph
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges
    for (const edge of graph.edges) {
        drawEdge(edge);
    }
    
    // Draw vertices
    for (const vertex of graph.vertices) {
        drawVertex(vertex);
    }
}

// Draw a vertex
function drawVertex(vertex) {
    ctx.beginPath();
    ctx.arc(vertex.x, vertex.y, VERTEX_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = vertex.color;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw label
    ctx.font = VERTEX_FONT;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(vertex.label, vertex.x, vertex.y);
}

// Draw an edge
function drawEdge(edge) {
    const fromVertex = graph.getVertex(edge.from);
    const toVertex = graph.getVertex(edge.to);
    
    if (!fromVertex || !toVertex) return;
    
    // Calculate direction vector
    const dx = toVertex.x - fromVertex.x;
    const dy = toVertex.y - fromVertex.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction vector
    const nx = dx / length;
    const ny = dy / length;
    
    // Calculate start and end points (adjusted for vertex radius)
    const startX = fromVertex.x + nx * VERTEX_RADIUS;
    const startY = fromVertex.y + ny * VERTEX_RADIUS;
    const endX = toVertex.x - nx * VERTEX_RADIUS;
    const endY = toVertex.y - ny * VERTEX_RADIUS;
    
    // Draw the edge
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = edge.color;
    ctx.lineWidth = EDGE_WIDTH;
    ctx.stroke();
    
    // Draw weight
    const midX = (fromVertex.x + toVertex.x) / 2;
    const midY = (fromVertex.y + toVertex.y) / 2;
    
    // Draw background for weight
    ctx.beginPath();
    ctx.arc(midX, midY, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw weight text
    ctx.font = EDGE_FONT;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(edge.weight.toString(), midX, midY);
}

// Get vertex at position
function getVertexAt(x, y) {
    for (const vertex of graph.vertices) {
        const dx = vertex.x - x;
        const dy = vertex.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= VERTEX_RADIUS) {
            return vertex;
        }
    }
    
    return null;
}

// Update the UI
function updateUI() {
    // Update step description
    stepDescriptionEl.textContent = algorithm.getCurrentStepDescription();
    
    // Update MST edges list
    mstEdgesEl.innerHTML = '';
    for (const edge of algorithm.mstEdges) {
        const fromVertex = graph.getVertex(edge.from);
        const toVertex = graph.getVertex(edge.to);
        const li = document.createElement('li');
        li.textContent = `${fromVertex.label} - ${toVertex.label} (${edge.weight})`;
        mstEdgesEl.appendChild(li);
    }
    
    // Update total weight
    totalWeightEl.textContent = `Total Weight: ${algorithm.totalWeight}`;
}

// Update vertex selects in the edge modal
function updateVertexSelects() {
    fromVertexSelect.innerHTML = '';
    toVertexSelect.innerHTML = '';
    
    for (const vertex of graph.vertices) {
        const fromOption = document.createElement('option');
        fromOption.value = vertex.id;
        fromOption.textContent = vertex.label;
        fromVertexSelect.appendChild(fromOption);
        
        const toOption = document.createElement('option');
        toOption.value = vertex.id;
        toOption.textContent = vertex.label;
        toVertexSelect.appendChild(toOption);
    }
    
    // Select different vertices by default if possible
    if (graph.vertices.length > 1) {
        toVertexSelect.selectedIndex = 1;
    }
}

// Switch algorithm
function switchAlgorithm(algorithmName) {
    if (isRunning) return;
    
    if (algorithmName === 'prims') {
        algorithm = new PrimsAlgorithm(graph);
        currentAlgorithmEl.textContent = "Current: Prim's Algorithm";
        algorithmDescriptionEl.textContent = "Prim's algorithm builds the MST by adding the minimum weight edge that connects a vertex in the tree to a vertex outside the tree.";
        primsBtn.classList.add('active');
        kruskalsBtn.classList.remove('active');
    } else {
        algorithm = new KruskalsAlgorithm(graph);
        currentAlgorithmEl.textContent = "Current: Kruskal's Algorithm";
        algorithmDescriptionEl.textContent = "Kruskal's algorithm builds the MST by adding the minimum weight edge that doesn't create a cycle.";
        primsBtn.classList.remove('active');
        kruskalsBtn.classList.add('active');
    }
    
    resetAlgorithm();
}

// Reset the algorithm
function resetAlgorithm() {
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
    
    isRunning = false;
    algorithm.reset();
    updateUI();
    render();
}

// Run the algorithm with animation
function runAlgorithm() {
    if (isRunning) return;
    if (graph.vertices.length < 2) {
        alert('Add at least 2 vertices to run the algorithm');
        return;
    }
    
    if (!graph.isConnected()) {
        alert('The graph must be connected to find an MST');
        return;
    }
    
    isRunning = true;
    algorithm.reset();
    algorithm.prepareAlgorithm();
    
    function animateStep() {
        const hasMoreSteps = algorithm.nextStep();
        updateUI();
        render();
        
        if (hasMoreSteps) {
            animationTimeout = setTimeout(animateStep, ANIMATION_SPEED);
        } else {
            isRunning = false;
        }
    }
    
    animateStep();
}

// Step through the algorithm
function stepAlgorithm() {
    if (isRunning) return;
    if (graph.vertices.length < 2) {
        alert('Add at least 2 vertices to run the algorithm');
        return;
    }
    
    if (!graph.isConnected()) {
        alert('The graph must be connected to find an MST');
        return;
    }
    
    // If this is the first step, prepare the algorithm
    if (algorithm.currentStepIndex === -1) {
        algorithm.prepareAlgorithm();
    }
    
    algorithm.nextStep();
    updateUI();
    render();
}

// Event Listeners
window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isAddingVertex) {
        graph.addVertex(x, y);
        render();
        isAddingVertex = false;
        addVertexBtn.classList.remove('active');
    } else if (isAddingEdge) {
        const vertex = getVertexAt(x, y);
        
        if (vertex) {
            if (!selectedVertex) {
                selectedVertex = vertex;
                vertex.color = '#FFA500';
                render();
            } else if (selectedVertex.id !== vertex.id) {
                // Open modal to set edge weight
                updateVertexSelects();
                fromVertexSelect.value = selectedVertex.id;
                toVertexSelect.value = vertex.id;
                edgeWeightInput.value = 1;
                edgeModal.style.display = 'block';
                
                // Reset selection
                selectedVertex.color = '#FFFFFF';
                selectedVertex = null;
                isAddingEdge = false;
                addEdgeBtn.classList.remove('active');
                render();
            }
        }
    }
});

addVertexBtn.addEventListener('click', () => {
    if (isRunning) return;
    
    isAddingVertex = !isAddingVertex;
    isAddingEdge = false;
    selectedVertex = null;
    
    addVertexBtn.classList.toggle('active');
    addEdgeBtn.classList.remove('active');
});

addEdgeBtn.addEventListener('click', () => {
    if (isRunning) return;
    if (graph.vertices.length < 2) {
        alert('Add at least 2 vertices to create an edge');
        return;
    }
    
    isAddingEdge = !isAddingEdge;
    isAddingVertex = false;
    selectedVertex = null;
    
    addEdgeBtn.classList.toggle('active');
    addVertexBtn.classList.remove('active');
    
    if (!isAddingEdge) {
        render();
    }
});

clearBtn.addEventListener('click', () => {
    if (isRunning) return;
    
    graph.clear();
    resetAlgorithm();
});

runBtn.addEventListener('click', runAlgorithm);
stepBtn.addEventListener('click', stepAlgorithm);
resetBtn.addEventListener('click', resetAlgorithm);

primsBtn.addEventListener('click', () => switchAlgorithm('prims'));
kruskalsBtn.addEventListener('click', () => switchAlgorithm('kruskals'));

closeModalBtn.addEventListener('click', () => {
    edgeModal.style.display = 'none';
});

confirmEdgeBtn.addEventListener('click', () => {
    const fromId = parseInt(fromVertexSelect.value);
    const toId = parseInt(toVertexSelect.value);
    const weight = parseInt(edgeWeightInput.value);
    
    if (fromId === toId) {
        alert('Cannot create an edge to the same vertex');
        return;
    }
    
    if (weight < 1) {
        alert('Weight must be at least 1');
        return;
    }
    
    graph.addEdge(fromId, toId, weight);
    edgeModal.style.display = 'none';
    render();
});

window.addEventListener('click', (e) => {
    if (e.target === edgeModal) {
        edgeModal.style.display = 'none';
    }
});

// Initialize
resizeCanvas();
updateUI(); 