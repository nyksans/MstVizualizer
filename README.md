# Minimum Spanning Tree Algorithm Visualizer

A visual tool to understand and compare Prim's and Kruskal's algorithms for finding Minimum Spanning Trees (MST) in graphs.

## Features

- Interactive graph creation with vertices and weighted edges
- Visualization of both Prim's and Kruskal's algorithms
- Step-by-step execution to understand each algorithm's decision process
- Automatic animation of the algorithm execution
- Information panel showing algorithm details and MST edges

## How to Use

1. **Open the Visualizer**: Open `index.html` in a web browser.

2. **Create a Graph**:

   - Click the "Add Vertex" button and then click on the canvas to place vertices
   - Click the "Add Edge" button, then click on two vertices to connect them
   - Enter the edge weight in the popup dialog

3. **Run the Algorithms**:

   - Select either "Prim's Algorithm" or "Kruskal's Algorithm"
   - Click "Run Algorithm" to see the full animation
   - Or click "Step" to go through the algorithm one step at a time
   - Use "Reset" to clear the algorithm's progress without changing the graph

4. **Other Controls**:
   - "Clear Graph" removes all vertices and edges
   - The information panel on the right shows details about the current algorithm and step

## Algorithm Descriptions

### Prim's Algorithm

Prim's algorithm builds the MST by starting from a single vertex and repeatedly adding the minimum weight edge that connects a vertex in the tree to a vertex outside the tree.

### Kruskal's Algorithm

Kruskal's algorithm builds the MST by sorting all edges by weight and adding them one by one, skipping any edge that would create a cycle.

## Implementation Details

The visualizer is built using:

- HTML5 Canvas for rendering the graph
- CSS for styling the interface
- JavaScript for implementing the algorithms and handling user interactions

The code is organized into three main JavaScript files:

- `graph.js`: Implements the graph data structure
- `algorithms.js`: Implements Prim's and Kruskal's algorithms
- `visualizer.js`: Handles UI interactions and rendering

## License

This project is open source and available for educational purposes.
