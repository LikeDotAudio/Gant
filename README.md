<!--
 * GANTT software is free to use and copy as needed.
 * Purpose: Project documentation and overview.
 -->

# Gantt WBS Workspace

A high-performance, dark-mode Gantt chart and Work Breakdown Structure (WBS) workspace built for speed, scalability, and visual clarity.

## 🚀 Key Features

- **Hierarchical WBS Management:** Build complex task structures with automated WBS ID generation (Root.Parent.Child.Sibling).
- **Interactive Gantt Timeline:** Drag-and-drop task movement, resizing, and progress tracking.
- **Multiple Views:**
  - **📊 Visual WBS:** The primary Gantt chart interface.
  - **📋 Spreadsheet:** A tabular representation of all tasks and milestones.
  - **📄 JSON Editor:** Direct access to the raw project data for advanced users.
- **Milestone Tracking:** Add and manage project milestones directly on the timeline.
- **Resistor Color Coding:** WBS columns use standard resistor color codes for instant hierarchical recognition.
- **Data Lifecycle:** Import/Export tasks and milestones via CSV or native JSON format.

## 🛠️ Performance Architecture

The application is engineered to handle large projects with thousands of tasks without compromising UI responsiveness:

1. **DOM Virtualization:** Only rows currently visible in the viewport are rendered. This drastically reduces memory usage and keeps the DOM tree lean.
2. **Web Worker Offloading:** Hierarchical calculations, WBS ID refreshing, and task "flattening" are performed in a background thread (`js/worker.js`). This prevents "UI freezing" during complex operations.
3. **Event Delegation:** A single event listener handles all interactions within the Gantt chart, reducing the overhead of thousands of individual event listeners.
4. **CSS Containment:** Uses `contain: content;` on rows to isolate layout and paint operations, speeding up rendering during scrolls and drags.
5. **Flattened State Caching:** Calculated task positions and dates are cached to minimize redundant processing during visual updates.

## 📂 Project Structure

- `index.html`: The main application shell and styles.
- `js/app.js`: Central application logic and state management.
- `js/renderer.js`: High-performance virtualized rendering logic.
- `js/Rows/index.js`: Core row management engine (facade for `js/Rows/`).
- `js/worker.js`: Background thread for heavy computations.
- `js/FoldTree.js`: Logic for hierarchy folding/unfolding.
- `js/MoveItem.js`: Task reordering and promotion/demotion logic.
- `js/Rows/add.js` & `js/Rows/deleteTask.js`: Centralized task lifecycle management.
- `js/milestones.js`: Milestone management and interaction.
- `js/progressbar/index.js`: Task bar dragging, resizing, and editing.

## 🚦 Getting Started

1. **Run Locally:** The project includes a simple Python server.
   ```bash
   python3 server.py
   ```
2. **Access:** Open `http://localhost:8080` in your browser.
3. **Keyboard Shortcuts (in Visual View):**
   - `ArrowUp / Down`: Navigate task selection.
   - `ArrowLeft / Right`: Fold/Unfold selected summary task.
   - `Ctrl + ArrowUp / Down`: Move task up or down within its parent.
   - `Ctrl + ArrowLeft / Right`: Promote (move out) or Demote (move into) the selected task.
   - `Enter`: Open the Edit Task overlay for the selected item.

## 📝 Data Format

Projects are saved as JSON. Milestones and Tasks are tracked in a unified structure:

```json
{
  "project": "My Project",
  "baseDate": "2026-04-29",
  "roots": [...],
  "milestones": [
    { "name": "Launch", "date": "2026-06-01" }
  ]
}
```

## 📄 License

Created by Anthony Kuzub. Part of the LikeDotAudio ecosystem.
