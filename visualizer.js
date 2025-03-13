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
const interactionModeEl = document.getElementById('interaction-mode');
const modeTextEl = document.querySelector('.mode-text');
const helpBtn = document.getElementById('help-btn');
const helpTooltip = document.getElementById('help-tooltip');
const importBtn = document.getElementById('import-btn');
const exportBtn = document.getElementById('export-btn');
const fileInput = document.getElementById('file-input');
const exportModal = document.getElementById('export-modal');
const exportCloseBtn = document.querySelector('.export-close');
const confirmExportBtn = document.getElementById('confirm-export-btn');
const vertexCountEl = document.getElementById('vertex-count');
const edgeCountEl = document.getElementById('edge-count');
const isConnectedEl = document.getElementById('is-connected');
const graphDensityEl = document.getElementById('graph-density');

// Constants
const VERTEX_RADIUS = 20;
const EDGE_WIDTH = 2.5;
const VERTEX_FONT = '16px "Montserrat", sans-serif';
const EDGE_FONT = '14px "Montserrat", sans-serif';
const ANIMATION_SPEED = 1000; // ms
const VERTEX_COLORS = {
    DEFAULT: '#f5f5f5',
    SELECTED: '#b47cff',
    IN_MST: '#64d8cb',
    CONSIDERING: '#7e57c2'
};
const EDGE_COLORS = {
    DEFAULT: 'rgba(255, 255, 255, 0.3)',
    IN_MST: '#64d8cb',
    CONSIDERING: '#7e57c2'
};

// State
const graph = new Graph();
let algorithm = new PrimsAlgorithm(graph);
let isAddingVertex = false;
let isAddingEdge = false;
let selectedVertex = null;
let animationTimeout = null;
let isRunning = false;
let isDragging = false;
let dragStartVertex = null;
let mouseX = 0;
let mouseY = 0;

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
    
    // Draw grid lines for better visual reference
    drawGrid();
    
    // Draw edges
    for (const edge of graph.edges) {
        drawEdge(edge);
    }
    
    // Draw vertices
    for (const vertex of graph.vertices) {
        drawVertex(vertex);
    }
}

// Draw a grid for better visual reference
function drawGrid() {
    const gridSize = 40;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Draw a vertex
function drawVertex(vertex) {
    // Draw glow for selected or MST vertices
    if (vertex.isInMST || vertex === selectedVertex || vertex === dragStartVertex) {
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, VERTEX_RADIUS + 5, 0, Math.PI * 2);
        
        if (vertex.isInMST) {
            ctx.fillStyle = 'rgba(100, 216, 203, 0.2)';
        } else {
            ctx.fillStyle = 'rgba(126, 87, 194, 0.2)';
        }
        
        ctx.fill();
    }
    
    // Draw vertex circle with gradient
    const gradient = ctx.createRadialGradient(
        vertex.x - 5, vertex.y - 5, 0,
        vertex.x, vertex.y, VERTEX_RADIUS
    );
    
    if (vertex.isInMST) {
        gradient.addColorStop(0, '#64d8cb');
        gradient.addColorStop(1, '#26a69a');
    } else if (vertex === selectedVertex || vertex === dragStartVertex) {
        gradient.addColorStop(0, '#b47cff');
        gradient.addColorStop(1, '#7e57c2');
    } else {
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#f0f0f0');
    }
    
    ctx.beginPath();
    ctx.arc(vertex.x, vertex.y, VERTEX_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw vertex border
    ctx.strokeStyle = vertex.isInMST ? 'rgba(38, 166, 154, 0.8)' : 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw label
    ctx.font = VERTEX_FONT;
    ctx.fillStyle = vertex.isInMST || vertex === selectedVertex || vertex === dragStartVertex ? '#ffffff' : '#333333';
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
    
    // Create gradient for edge
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    
    if (edge.isInMST) {
        gradient.addColorStop(0, '#26a69a');
        gradient.addColorStop(1, '#64d8cb');
        ctx.strokeStyle = gradient;
        ctx.shadowColor = 'rgba(38, 166, 154, 0.5)';
        ctx.shadowBlur = 4;
    } else {
        ctx.strokeStyle = EDGE_COLORS.DEFAULT;
        ctx.shadowBlur = 0;
    }
    
    ctx.lineWidth = EDGE_WIDTH;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Draw weight
    const midX = (fromVertex.x + toVertex.x) / 2;
    const midY = (fromVertex.y + toVertex.y) / 2;
    
    // Draw background for weight
    ctx.beginPath();
    ctx.arc(midX, midY, 14, 0, Math.PI * 2);
    
    if (edge.isInMST) {
        const weightGradient = ctx.createRadialGradient(
            midX, midY, 0,
            midX, midY, 14
        );
        weightGradient.addColorStop(0, '#64d8cb');
        weightGradient.addColorStop(1, '#26a69a');
        ctx.fillStyle = weightGradient;
    } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    }
    
    ctx.fill();
    ctx.strokeStyle = edge.isInMST ? 'rgba(38, 166, 154, 0.8)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw weight text
    ctx.font = EDGE_FONT;
    ctx.fillStyle = edge.isInMST ? '#ffffff' : '#333333';
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
        showNotification('Add at least 2 vertices to run the algorithm');
        return;
    }
    
    if (!graph.isConnected()) {
        showNotification('The graph must be connected to find an MST');
        return;
    }
    
    isRunning = true;
    algorithm.reset();
    algorithm.prepareAlgorithm();
    updateInteractionMode('Algorithm running...');
    
    function animateStep() {
        const hasMoreSteps = algorithm.nextStep();
        updateUI();
        render();
        
        if (hasMoreSteps) {
            animationTimeout = setTimeout(animateStep, ANIMATION_SPEED);
        } else {
            isRunning = false;
            updateInteractionMode('Algorithm complete! Shift+Click to add vertex, Drag between vertices to add edge');
        }
    }
    
    animateStep();
}

// Step through the algorithm
function stepAlgorithm() {
    if (isRunning) return;
    if (graph.vertices.length < 2) {
        showNotification('Add at least 2 vertices to run the algorithm');
        return;
    }
    
    if (!graph.isConnected()) {
        showNotification('The graph must be connected to find an MST');
        return;
    }
    
    // If this is the first step, prepare the algorithm
    if (algorithm.currentStepIndex === -1) {
        algorithm.prepareAlgorithm();
        updateInteractionMode('Stepping through algorithm...');
    }
    
    algorithm.nextStep();
    updateUI();
    render();
    
    if (algorithm.currentStepIndex >= algorithm.steps.length - 1) {
        updateInteractionMode('Algorithm complete! Shift+Click to add vertex, Drag between vertices to add edge');
    }
}

// Show a notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Event Listeners
window.addEventListener('resize', resizeCanvas);

// Track mouse position for drawing the drag line
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    if (isDragging && dragStartVertex) {
        render();
        
        // Draw a line from the start vertex to the current mouse position
        ctx.beginPath();
        ctx.moveTo(dragStartVertex.x, dragStartVertex.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = 'rgba(126, 87, 194, 0.5)';
        ctx.lineWidth = EDGE_WIDTH;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (isRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const vertex = getVertexAt(x, y);
    
    // If we clicked on a vertex, start dragging to create an edge
    if (vertex) {
        isDragging = true;
        dragStartVertex = vertex;
        vertex.color = VERTEX_COLORS.SELECTED;
        render();
        updateInteractionMode('Drag to another vertex to create an edge');
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const vertex = getVertexAt(x, y);
    
    // If we were dragging and released on a different vertex, create an edge
    if (isDragging && dragStartVertex && vertex && vertex.id !== dragStartVertex.id) {
        // Open modal to set edge weight
        updateVertexSelects();
        fromVertexSelect.value = dragStartVertex.id;
        toVertexSelect.value = vertex.id;
        edgeWeightInput.value = 1;
        edgeModal.style.display = 'block';
        updateInteractionMode('Setting edge weight...');
    } 
    // If we were dragging and released on empty space, do nothing
    else if (isDragging && dragStartVertex) {
        dragStartVertex.color = VERTEX_COLORS.DEFAULT;
        updateInteractionMode('Shift+Click to add vertex, Drag between vertices to add edge');
    }
    // If we weren't dragging and clicked on empty space, create a vertex (with Shift key)
    else if (!vertex && e.shiftKey) {
        const id = graph.addVertex(x, y);
        showNotification(`Vertex ${graph.getVertex(id).label} added`);
        updateInteractionMode('Vertex added! Drag between vertices to create edges');
    }
    
    // Reset dragging state
    isDragging = false;
    if (dragStartVertex) {
        dragStartVertex.color = VERTEX_COLORS.DEFAULT;
        dragStartVertex = null;
    }
    
    render();
});

// Update the existing click handler to work with the new interaction model
canvas.addEventListener('click', (e) => {
    if (isRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // If buttons are active, use the old behavior
    if (isAddingVertex) {
        const id = graph.addVertex(x, y);
        showNotification(`Vertex ${graph.getVertex(id).label} added`);
        render();
        isAddingVertex = false;
        addVertexBtn.classList.remove('active');
        updateInteractionMode('Vertex added! Drag between vertices to create edges');
    } else if (isAddingEdge) {
        const vertex = getVertexAt(x, y);
        
        if (vertex) {
            if (!selectedVertex) {
                selectedVertex = vertex;
                vertex.color = VERTEX_COLORS.SELECTED;
                render();
                updateInteractionMode('Select second vertex to create an edge');
            } else if (selectedVertex.id !== vertex.id) {
                // Open modal to set edge weight
                updateVertexSelects();
                fromVertexSelect.value = selectedVertex.id;
                toVertexSelect.value = vertex.id;
                edgeWeightInput.value = 1;
                edgeModal.style.display = 'block';
                
                // Reset selection
                selectedVertex.color = VERTEX_COLORS.DEFAULT;
                selectedVertex = null;
                isAddingEdge = false;
                addEdgeBtn.classList.remove('active');
                render();
                updateInteractionMode('Setting edge weight...');
            }
        }
    }
});

// Function to update the interaction mode display
function updateInteractionMode(message) {
    if (modeTextEl) {
        modeTextEl.textContent = message;
    }
}

// Update button event listeners
addVertexBtn.addEventListener('click', () => {
    if (isRunning) return;
    
    isAddingVertex = !isAddingVertex;
    isAddingEdge = false;
    selectedVertex = null;
    
    addVertexBtn.classList.toggle('active');
    addEdgeBtn.classList.remove('active');
    
    if (isAddingVertex) {
        updateInteractionMode('Click anywhere to add a vertex');
    } else {
        updateInteractionMode('Shift+Click to add vertex, Drag between vertices to add edge');
    }
});

addEdgeBtn.addEventListener('click', () => {
    if (isRunning) return;
    if (graph.vertices.length < 2) {
        showNotification('Add at least 2 vertices to create an edge');
        return;
    }
    
    isAddingEdge = !isAddingEdge;
    isAddingVertex = false;
    selectedVertex = null;
    
    addEdgeBtn.classList.toggle('active');
    addVertexBtn.classList.remove('active');
    
    if (isAddingEdge) {
        updateInteractionMode('Select first vertex to create an edge');
    } else {
        updateInteractionMode('Shift+Click to add vertex, Drag between vertices to add edge');
    }
    
    render();
});

clearBtn.addEventListener('click', () => {
    if (isRunning) return;
    
    if (graph.vertices.length > 0) {
        if (confirm('Are you sure you want to clear the graph?')) {
            graph.clear();
            resetAlgorithm();
            showNotification('Graph cleared');
            updateInteractionMode('Graph cleared! Shift+Click to add vertex');
        }
    } else {
        showNotification('Graph is already empty');
    }
});

runBtn.addEventListener('click', runAlgorithm);
stepBtn.addEventListener('click', stepAlgorithm);
resetBtn.addEventListener('click', () => {
    resetAlgorithm();
    updateInteractionMode('Algorithm reset! Shift+Click to add vertex, Drag between vertices to add edge');
});

primsBtn.addEventListener('click', () => switchAlgorithm('prims'));
kruskalsBtn.addEventListener('click', () => switchAlgorithm('kruskals'));

closeModalBtn.addEventListener('click', () => {
    edgeModal.style.display = 'none';
    updateInteractionMode('Shift+Click to add vertex, Drag between vertices to add edge');
});

confirmEdgeBtn.addEventListener('click', () => {
    const fromId = parseInt(fromVertexSelect.value);
    const toId = parseInt(toVertexSelect.value);
    const weight = parseInt(edgeWeightInput.value);
    
    if (fromId === toId) {
        showNotification('Cannot create an edge to the same vertex');
        return;
    }
    
    if (weight < 1) {
        showNotification('Weight must be at least 1');
        return;
    }
    
    const fromVertex = graph.getVertex(fromId);
    const toVertex = graph.getVertex(toId);
    
    graph.addEdge(fromId, toId, weight);
    edgeModal.style.display = 'none';
    showNotification(`Edge from ${fromVertex.label} to ${toVertex.label} with weight ${weight} added`);
    updateInteractionMode('Edge added! Shift+Click to add vertex, Drag between vertices to add edge');
    render();
});

window.addEventListener('click', (e) => {
    if (e.target === edgeModal) {
        edgeModal.style.display = 'none';
        updateInteractionMode('Shift+Click to add vertex, Drag between vertices to add edge');
    }
});

// Add keyboard shortcuts
window.addEventListener('keydown', (e) => {
    if (isRunning) return;
    
    // 'V' key for vertex mode
    if (e.key === 'v' || e.key === 'V') {
        addVertexBtn.click();
    }
    
    // 'E' key for edge mode
    if (e.key === 'e' || e.key === 'E') {
        addEdgeBtn.click();
    }
    
    // 'R' key for run
    if (e.key === 'r' || e.key === 'R') {
        runBtn.click();
    }
    
    // 'S' key for step
    if (e.key === 's' || e.key === 'S') {
        stepBtn.click();
    }
    
    // 'C' key for clear
    if (e.key === 'c' || e.key === 'C') {
        clearBtn.click();
    }
    
    // 'I' key for import
    if (e.key === 'i' || e.key === 'I') {
        importBtn.click();
    }
    
    // 'O' key for export (save)
    if (e.key === 'o' || e.key === 'O') {
        exportBtn.click();
    }
    
    // Escape key to cancel current operation
    if (e.key === 'Escape') {
        if (isAddingVertex || isAddingEdge) {
            isAddingVertex = false;
            isAddingEdge = false;
            addVertexBtn.classList.remove('active');
            addEdgeBtn.classList.remove('active');
            
            if (selectedVertex) {
                selectedVertex.color = VERTEX_COLORS.DEFAULT;
                selectedVertex = null;
                render();
            }
            
            updateInteractionMode('Shift+Click to add vertex, Drag between vertices to add edge');
        }
        
        if (edgeModal.style.display === 'block') {
            edgeModal.style.display = 'none';
            updateInteractionMode('Shift+Click to add vertex, Drag between vertices to add edge');
        }
    }
});

// Help button functionality
helpBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the click from closing the tooltip
    helpTooltip.style.display = helpTooltip.style.display === 'block' ? 'none' : 'block';
});

// Close the tooltip when clicking outside
document.addEventListener('click', (e) => {
    if (helpTooltip.style.display === 'block' && e.target !== helpBtn && !helpTooltip.contains(e.target)) {
        helpTooltip.style.display = 'none';
    }
});

// Import/Export functionality
importBtn.addEventListener('click', () => {
    if (isRunning) return;
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
        try {
            const success = graph.fromJSON(event.target.result);
            
            if (success) {
                resetAlgorithm();
                updateVertexSelects();
                showNotification('Graph imported successfully');
                updateInteractionMode('Graph imported! You can now run algorithms or continue editing');
            } else {
                showNotification('Failed to import graph: Invalid format');
            }
        } catch (error) {
            console.error('Error importing graph:', error);
            showNotification('Failed to import graph: ' + error.message);
        }
        
        // Clear the file input so the same file can be selected again
        fileInput.value = '';
    };
    
    reader.onerror = () => {
        showNotification('Error reading file');
        fileInput.value = '';
    };
    
    reader.readAsText(file);
});

exportBtn.addEventListener('click', () => {
    if (graph.vertices.length === 0) {
        showNotification('Nothing to export: Graph is empty');
        return;
    }
    
    // Update graph statistics
    updateGraphStatistics();
    
    // Show export modal
    exportModal.style.display = 'block';
});

// Function to update graph statistics
function updateGraphStatistics() {
    const vertexCount = graph.vertices.length;
    const edgeCount = graph.edges.length;
    const isConnected = graph.isConnected();
    
    // Calculate graph density (ratio of actual edges to maximum possible edges)
    let density = 0;
    if (vertexCount > 1) {
        const maxEdges = (vertexCount * (vertexCount - 1)) / 2; // Maximum possible edges in an undirected graph
        density = (edgeCount / maxEdges) * 100;
    }
    
    vertexCountEl.textContent = vertexCount;
    edgeCountEl.textContent = edgeCount;
    isConnectedEl.textContent = isConnected ? 'Yes' : 'No';
    graphDensityEl.textContent = density.toFixed(1) + '%';
}

// Close export modal
exportCloseBtn.addEventListener('click', () => {
    exportModal.style.display = 'none';
});

// Export graph in selected format
confirmExportBtn.addEventListener('click', () => {
    const format = document.querySelector('input[name="export-format"]:checked').value;
    let content = '';
    let filename = '';
    let mimeType = '';
    
    switch (format) {
        case 'json':
            content = graph.toJSON();
            filename = 'graph.json';
            mimeType = 'application/json';
            break;
            
        case 'adjacency':
            content = generateAdjacencyMatrix();
            filename = 'adjacency_matrix.txt';
            mimeType = 'text/plain';
            break;
            
        case 'edge-list':
            content = generateEdgeList();
            filename = 'edge_list.txt';
            mimeType = 'text/plain';
            break;
    }
    
    // Create blob and download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        exportModal.style.display = 'none';
    }, 100);
    
    showNotification(`Graph exported as ${format.toUpperCase()}`);
});

// Generate adjacency matrix representation
function generateAdjacencyMatrix() {
    const vertices = graph.vertices;
    if (vertices.length === 0) return '';
    
    // Create header row with vertex labels
    let matrix = '  ' + vertices.map(v => v.label).join(' ') + '\n';
    
    // Create matrix rows
    for (const vertex of vertices) {
        let row = vertex.label + ' ';
        
        for (const otherVertex of vertices) {
            const edge = graph.getEdge(vertex.id, otherVertex.id);
            row += (edge ? edge.weight : 0) + ' ';
        }
        
        matrix += row.trim() + '\n';
    }
    
    return matrix;
}

// Generate edge list representation
function generateEdgeList() {
    if (graph.edges.length === 0) return '';
    
    let edgeList = 'From To Weight\n';
    
    for (const edge of graph.edges) {
        const fromVertex = graph.getVertex(edge.from);
        const toVertex = graph.getVertex(edge.to);
        
        edgeList += `${fromVertex.label} ${toVertex.label} ${edge.weight}\n`;
    }
    
    return edgeList;
}

// Close the export modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === exportModal) {
        exportModal.style.display = 'none';
    }
});

// Update the help tooltip to include import/export instructions
const helpList = helpTooltip.querySelector('ul');
const importExportTip = document.createElement('li');
importExportTip.innerHTML = `<span class="tip-icon"></span> <strong>Import/Export:</strong> Use the Import and Export buttons to save and load graphs`;
helpList.appendChild(importExportTip);

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--primary-gradient);
    color: white;
    padding: 12px 25px;
    border-radius: 30px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    font-family: 'Exo 2', sans-serif;
    font-weight: 600;
    z-index: 1000;
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.notification.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
}
`;
document.head.appendChild(style);

// Initialize
resizeCanvas();
updateUI();
updateInteractionMode('Shift+Click to add vertex, Drag between vertices to add edge'); 