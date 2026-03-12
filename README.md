# Minimum Spanning Tree Algorithm Visualizer

An interactive visual tool for learning and comparing **Prim's Algorithm** and **Kruskal's Algorithm** for finding **Minimum Spanning Trees (MST)** in weighted graphs.

The visualizer allows users to **build graphs interactively, run MST algorithms step-by-step, animate the process, and export results**.

---

<img width="1840" height="977" alt="image" src="https://github.com/user-attachments/assets/acbb131c-3e67-44bf-b16a-70c9010735f1" />


# Features

### Interactive Graph Editor

* Add vertices by clicking on the canvas
* Create weighted edges by connecting vertices
* Drag vertices to reposition them
* Clear graph or undo/redo changes

### Algorithm Visualization

* Run **Prim's Algorithm**
* Run **Kruskal's Algorithm**
* Step-by-step execution mode
* Automatic algorithm animation
* Timeline slider to inspect steps

### Visualization Tools

* Highlighted MST edges
* Total MST weight display
* Algorithm step descriptions
* Graph physics layout for automatic spacing

### Import / Export

Supports multiple formats:

Export formats:

* JSON
* Network JSON
* CSV edge list
* Edge list array

Import formats:

* JSON graphs
* CSV edge lists

### GIF Export

Export the **algorithm animation as a GIF** for presentations or reports.

### UI Features

* Dark mode and light mode
* Responsive interface
* Tooltip support
* Clean algorithm information panel

---

# Getting Started

## 1. Run the Visualizer

Open the project in any modern browser.

```text
index.html
```

No installation or build step is required.

---

# How to Use

## Create a Graph

1. Click **Add Vertex**
2. Click on the canvas to place vertices
3. Click **Add Edge**
4. Drag from one vertex to another
5. Enter the edge weight

You can drag vertices anytime to rearrange the graph.

---

## Run an Algorithm

1. Select **Prim** or **Kruskal**
2. Click **Run** to animate the algorithm
3. Use **Step** to execute one step at a time
4. Use **Reset** to restart the algorithm

The **timeline slider** lets you move between steps.

---

## Import / Export Graphs

### Export

Choose a format from the export dropdown:

```
JSON
Network JSON
CSV
Edge List
```

Then click **Export**.

### Import

Click **Import** and select a supported file.

---

## Export Animation

After running an algorithm:

1. Click **GIF**
2. The animation will download as a `.gif` file

Useful for **presentations or reports**.

---

# Algorithms

## Prim's Algorithm

Prim's algorithm builds a minimum spanning tree by starting from a single vertex and repeatedly selecting the **lowest weight edge that connects the current tree to a new vertex**.

Time Complexity:

```
O(E log V)
```

---

## Kruskal's Algorithm

Kruskal's algorithm builds the MST by **sorting all edges by weight** and adding them one by one while avoiding cycles.

Time Complexity:

```
O(E log E)
```

---

# Project Structure

```
project/
│
├── index.html
├── styles.css
├── visualizer.js
├── graph.js
├── algorithms.js
├── physics.js
├── recorder.js
│
└── assets/
    └── logo.svg
```

### File Responsibilities

**graph.js**

Graph data structure and import/export utilities.

**algorithms.js**

Implementation of Prim's and Kruskal's algorithms.

**visualizer.js**

Handles UI interactions, graph editing, and rendering.

**physics.js**

Force-directed layout for automatic vertex positioning.

**recorder.js**

Controls playback and GIF export.

---

# Technologies Used

* HTML5 Canvas
* CSS3
* Vanilla JavaScript
* GIF.js for animation export

No frameworks or build tools are required.

---

# Educational Purpose

This project is designed to help students and developers:

* Understand how MST algorithms work
* Visualize algorithm decisions step-by-step
* Experiment with different graph structures

---

# License

This project is open source and intended for **educational and learning purposes**.
