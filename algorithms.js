/**
 * Implementation of MST algorithms
 */

class MSTAlgorithm {
    constructor(graph) {
        this.graph = graph;
        this.steps = [];
        this.currentStepIndex = -1;
        this.mstEdges = [];
        this.totalWeight = 0;
    }

    /**
     * Reset the algorithm state
     */
    reset() {
        this.steps = [];
        this.currentStepIndex = -1;
        this.mstEdges = [];
        this.totalWeight = 0;
        this.graph.reset();
    }

    /**
     * Get the current step description
     * @returns {string} - description of the current step
     */
    getCurrentStepDescription() {
        if (this.currentStepIndex < 0 || this.currentStepIndex >= this.steps.length) {
            return "No algorithm running";
        }
        return this.steps[this.currentStepIndex].description;
    }

    /**
     * Move to the next step in the algorithm
     * @returns {boolean} - true if there are more steps, false if the algorithm is complete
     */
    nextStep() {
        if (this.currentStepIndex >= this.steps.length - 1) {
            return false;
        }
        
        this.currentStepIndex++;
        const step = this.steps[this.currentStepIndex];
        
        // Apply the step's changes
        this.applyStep(step);
        
        return this.currentStepIndex < this.steps.length - 1;
    }

    /**
     * Apply a step's changes to the graph
     * @param {Object} step - the step to apply
     */
    applyStep(step) {
        // Apply vertex changes
        if (step.vertexChanges) {
            for (const change of step.vertexChanges) {
                const vertex = this.graph.getVertex(change.id);
                if (vertex) {
                    Object.assign(vertex, change.properties);
                }
            }
        }
        
        // Apply edge changes
        if (step.edgeChanges) {
            for (const change of step.edgeChanges) {
                const edge = this.graph.getEdge(change.from, change.to);
                if (edge) {
                    Object.assign(edge, change.properties);
                    
                    // If the edge is being added to the MST
                    if (change.properties.isInMST && !this.mstEdges.some(e => e.from === edge.from && e.to === edge.to)) {
                        this.mstEdges.push(edge);
                        this.totalWeight += edge.weight;
                    }
                }
            }
        }
    }

    /**
     * Run the algorithm to completion
     */
    runToCompletion() {
        this.reset();
        this.prepareAlgorithm();
        
        while (this.nextStep()) {
            // Continue until all steps are executed
        }
    }

    /**
     * Prepare the algorithm (to be implemented by subclasses)
     */
    prepareAlgorithm() {
        // To be implemented by subclasses
    }
}

/**
 * Prim's Algorithm implementation
 */
class PrimsAlgorithm extends MSTAlgorithm {
    prepareAlgorithm() {
        if (this.graph.vertices.length === 0) {
            return;
        }

        // Initialize data structures
        const visited = new Set();
        const unvisited = new Set(this.graph.vertices.map(v => v.id));
        
        // Start with the first vertex
        const startVertex = this.graph.vertices[0];
        visited.add(startVertex.id);
        unvisited.delete(startVertex.id);
        
        // Add first step - mark the starting vertex
        this.steps.push({
            description: `Starting Prim's algorithm from vertex ${startVertex.label}`,
            vertexChanges: [
                { id: startVertex.id, properties: { color: '#9d50bb', isInMST: true } }
            ]
        });
        
        // While there are unvisited vertices
        while (unvisited.size > 0) {
            let minEdge = null;
            let minWeight = Infinity;
            let nextVertex = null;
            
            // Find the minimum weight edge from visited to unvisited
            for (const visitedId of visited) {
                for (const edge of this.graph.getEdgesForVertex(visitedId)) {
                    const otherVertexId = edge.from === visitedId ? edge.to : edge.from;
                    
                    if (unvisited.has(otherVertexId) && edge.weight < minWeight) {
                        minEdge = edge;
                        minWeight = edge.weight;
                        nextVertex = otherVertexId;
                    }
                }
            }
            
            // If no edge found, the graph is disconnected
            if (!minEdge) {
                this.steps.push({
                    description: "Graph is disconnected. Cannot complete MST."
                });
                break;
            }
            
            // Add step - consider the minimum edge
            this.steps.push({
                description: `Considering edge ${this.graph.getVertex(minEdge.from).label}-${this.graph.getVertex(minEdge.to).label} with weight ${minEdge.weight}`,
                edgeChanges: [
                    { from: minEdge.from, to: minEdge.to, properties: { color: '#FFA500' } }
                ]
            });
            
            // Add step - add the edge to MST and the vertex
            this.steps.push({
                description: `Adding edge ${this.graph.getVertex(minEdge.from).label}-${this.graph.getVertex(minEdge.to).label} to MST`,
                vertexChanges: [
                    { id: nextVertex, properties: { color: '#9d50bb', isInMST: true } }
                ],
                edgeChanges: [
                    { from: minEdge.from, to: minEdge.to, properties: { color: '#00b09b', isInMST: true } }
                ]
            });
            
            // Update sets
            visited.add(nextVertex);
            unvisited.delete(nextVertex);
        }
        
        // Final step
        this.steps.push({
            description: `Prim's algorithm complete. MST has ${visited.size} vertices and ${visited.size - 1} edges.`
        });
    }
}

/**
 * Kruskal's Algorithm implementation
 */
class KruskalsAlgorithm extends MSTAlgorithm {
    prepareAlgorithm() {
        if (this.graph.vertices.length === 0) {
            return;
        }

        // Initialize disjoint set for Union-Find
        const parent = {};
        const rank = {};
        
        // Make set for each vertex
        for (const vertex of this.graph.vertices) {
            parent[vertex.id] = vertex.id;
            rank[vertex.id] = 0;
        }
        
        // Find function for Union-Find
        const find = (id) => {
            if (parent[id] !== id) {
                parent[id] = find(parent[id]);
            }
            return parent[id];
        };
        
        // Union function for Union-Find
        const union = (x, y) => {
            const rootX = find(x);
            const rootY = find(y);
            
            if (rootX === rootY) return;
            
            if (rank[rootX] < rank[rootY]) {
                parent[rootX] = rootY;
            } else if (rank[rootX] > rank[rootY]) {
                parent[rootY] = rootX;
            } else {
                parent[rootY] = rootX;
                rank[rootX]++;
            }
        };
        
        // Sort edges by weight
        const sortedEdges = [...this.graph.edges].sort((a, b) => a.weight - b.weight);
        
        // Add first step
        this.steps.push({
            description: `Starting Kruskal's algorithm with ${sortedEdges.length} edges sorted by weight`
        });
        
        // Highlight all vertices
        this.steps.push({
            description: "Each vertex starts in its own set",
            vertexChanges: this.graph.vertices.map(v => ({
                id: v.id,
                properties: { color: '#9d50bb' }
            }))
        });
        
        let mstEdgeCount = 0;
        
        // Process edges in order of increasing weight
        for (const edge of sortedEdges) {
            // Add step - consider the current edge
            this.steps.push({
                description: `Considering edge ${this.graph.getVertex(edge.from).label}-${this.graph.getVertex(edge.to).label} with weight ${edge.weight}`,
                edgeChanges: [
                    { from: edge.from, to: edge.to, properties: { color: '#FFA500' } }
                ]
            });
            
            const rootFrom = find(edge.from);
            const rootTo = find(edge.to);
            
            // Check if adding the edge creates a cycle
            if (rootFrom !== rootTo) {
                // Add step - add the edge to MST
                this.steps.push({
                    description: `Adding edge ${this.graph.getVertex(edge.from).label}-${this.graph.getVertex(edge.to).label} to MST`,
                    edgeChanges: [
                        { from: edge.from, to: edge.to, properties: { color: '#00b09b', isInMST: true } }
                    ]
                });
                
                union(edge.from, edge.to);
                mstEdgeCount++;
                
                // If we have enough edges, we're done
                if (mstEdgeCount === this.graph.vertices.length - 1) {
                    break;
                }
            } else {
                // Add step - skip the edge (would create a cycle)
                this.steps.push({
                    description: `Skipping edge ${this.graph.getVertex(edge.from).label}-${this.graph.getVertex(edge.to).label} (would create a cycle)`,
                    edgeChanges: [
                        { from: edge.from, to: edge.to, properties: { color: '#AAAAAA' } }
                    ]
                });
            }
        }
        
        // Final step
        this.steps.push({
            description: `Kruskal's algorithm complete. MST has ${this.graph.vertices.length} vertices and ${mstEdgeCount} edges.`
        });
    }
} 