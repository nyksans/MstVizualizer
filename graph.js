/**
 * Graph class to represent the graph data structure
 */
class Graph {
    constructor() {
        this.vertices = [];
        this.edges = [];
        this.nextVertexId = 0;
    }

    /**
     * Add a vertex to the graph
     * @param {number} x - x coordinate
     * @param {number} y - y coordinate
     * @returns {number} - the id of the new vertex
     */
    addVertex(x, y) {
        const id = this.nextVertexId++;
        this.vertices.push({
            id,
            x,
            y,
            label: String.fromCharCode(65 + id), // A, B, C, ...
            color: '#FFFFFF',
            isInMST: false
        });
        return id;
    }

    /**
     * Add an edge to the graph
     * @param {number} fromId - source vertex id
     * @param {number} toId - target vertex id
     * @param {number} weight - edge weight
     * @returns {number} - the index of the new edge
     */
    addEdge(fromId, toId, weight) {
        // Check if edge already exists
        const existingEdge = this.edges.find(e => 
            (e.from === fromId && e.to === toId) || 
            (e.from === toId && e.to === fromId)
        );
        
        if (existingEdge) {
            existingEdge.weight = weight;
            return this.edges.indexOf(existingEdge);
        }
        
        const edge = {
            from: fromId,
            to: toId,
            weight,
            color: '#AAAAAA',
            isInMST: false
        };
        
        this.edges.push(edge);
        return this.edges.length - 1;
    }

    /**
     * Get a vertex by its id
     * @param {number} id - vertex id
     * @returns {Object|null} - the vertex or null if not found
     */
    getVertex(id) {
        return this.vertices.find(v => v.id === id) || null;
    }

    /**
     * Get all edges connected to a vertex
     * @param {number} vertexId - vertex id
     * @returns {Array} - array of edges
     */
    getEdgesForVertex(vertexId) {
        return this.edges.filter(e => e.from === vertexId || e.to === vertexId);
    }

    /**
     * Get all adjacent vertices to a vertex
     * @param {number} vertexId - vertex id
     * @returns {Array} - array of vertex ids
     */
    getAdjacentVertices(vertexId) {
        const adjacentVertices = [];
        
        for (const edge of this.edges) {
            if (edge.from === vertexId) {
                adjacentVertices.push(edge.to);
            } else if (edge.to === vertexId) {
                adjacentVertices.push(edge.from);
            }
        }
        
        return adjacentVertices;
    }

    /**
     * Get the edge between two vertices
     * @param {number} fromId - source vertex id
     * @param {number} toId - target vertex id
     * @returns {Object|null} - the edge or null if not found
     */
    getEdge(fromId, toId) {
        return this.edges.find(e => 
            (e.from === fromId && e.to === toId) || 
            (e.from === toId && e.to === fromId)
        ) || null;
    }

    /**
     * Reset all vertices and edges to their default state
     */
    reset() {
        for (const vertex of this.vertices) {
            vertex.color = '#FFFFFF';
            vertex.isInMST = false;
        }
        
        for (const edge of this.edges) {
            edge.color = '#AAAAAA';
            edge.isInMST = false;
        }
    }

    /**
     * Clear the graph completely
     */
    clear() {
        this.vertices = [];
        this.edges = [];
        this.nextVertexId = 0;
    }

    /**
     * Check if the graph is connected
     * @returns {boolean} - true if the graph is connected
     */
    isConnected() {
        if (this.vertices.length === 0) return true;
        
        const visited = new Set();
        const queue = [this.vertices[0].id];
        
        while (queue.length > 0) {
            const currentId = queue.shift();
            visited.add(currentId);
            
            const adjacentVertices = this.getAdjacentVertices(currentId);
            for (const adjId of adjacentVertices) {
                if (!visited.has(adjId)) {
                    queue.push(adjId);
                }
            }
        }
        
        return visited.size === this.vertices.length;
    }

    /**
     * Serialize the graph to a JSON string
     * @returns {string} - JSON string representation of the graph
     */
    toJSON() {
        return JSON.stringify({
            vertices: this.vertices.map(v => ({
                id: v.id,
                x: v.x,
                y: v.y,
                label: v.label
            })),
            edges: this.edges.map(e => ({
                from: e.from,
                to: e.to,
                weight: e.weight
            })),
            nextVertexId: this.nextVertexId
        });
    }

    /**
     * Load a graph from a JSON string
     * @param {string} json - JSON string representation of the graph
     * @returns {boolean} - true if successful
     */
    fromJSON(json) {
        try {
            const data = JSON.parse(json);
            
            // Clear existing graph
            this.clear();
            
            // Load vertices
            if (Array.isArray(data.vertices)) {
                this.vertices = data.vertices.map(v => ({
                    id: v.id,
                    x: v.x,
                    y: v.y,
                    label: v.label,
                    color: '#FFFFFF',
                    isInMST: false
                }));
            }
            
            // Load edges
            if (Array.isArray(data.edges)) {
                this.edges = data.edges.map(e => ({
                    from: e.from,
                    to: e.to,
                    weight: e.weight,
                    color: '#AAAAAA',
                    isInMST: false
                }));
            }
            
            // Set next vertex ID
            if (typeof data.nextVertexId === 'number') {
                this.nextVertexId = data.nextVertexId;
            } else {
                // If nextVertexId is not provided, calculate it from vertices
                this.nextVertexId = this.vertices.length > 0 
                    ? Math.max(...this.vertices.map(v => v.id)) + 1 
                    : 0;
            }
            
            return true;
        } catch (error) {
            console.error('Error loading graph from JSON:', error);
            return false;
        }
    }
} 