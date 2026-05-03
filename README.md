<!--
 * Gan't Do it software is free to use and copy as needed.
 * Purpose: Project documentation and overview.
 -->

# Gan't Do it

A procrastination organizer / productivity prioritizer.

## 🎭 The Gantt Chart: A Reality Check

- **Task List** = **T**otally **A**rbitrary **S**eries of **K**nown **L**ies **I**n **S**equential **T**ime
  *Because let's face it, half of these incredibly detailed line items are getting completely scrapped by Phase 2 anyway.*

- **Timeline** = **T**ime **I**s **M**erely **E**stimated, **L**ikely **I**gnored, **N**ever **E**xact
  *The magical horizontal axis where project managers pretend they know exactly what an engineer will be doing at 3:15 PM on a Thursday six months from now.*

- **Task Bars** = **B**ullshit **A**pproximations **R**equiring **S**tretching
  *Those brightly colored rectangles that you will inevitably and quietly drag to the right on a Friday afternoon when nobody is looking.*

- **Milestones** = **M**irages **I**nvolving **L**ots of **E**xtra **S**tress, **T**ears, **O**r **N**ew **E**xcuses
  *Usually marked with a diamond shape, which is fitting because trying to actually hit one requires intense, crushing pressure and costs way too much money.*

- **Dependencies** = **D**omino **E**ffects **P**roducing **E**ndless **N**ew **D**elays
  *The little connecting arrows that mathematically prove why Steve in accounting is the sole reason the entire project is three months late.*

- **Progress Indicators** = **P**olitely **R**eported **O**utright **G**uesses **R**egarding **E**xpected **S**uccess
  *Ah, the progress bar shading. Because according to the universal laws of project management, a task is always mysteriously "90% done" for three straight weeks.*

- **Current Date Marker** = **T**he **O**bvious **D**oom **A**pproaching **Y**ou
  *That unforgiving, bright red vertical line of judgment that slices through the chart just to visually scream, "Look how far behind schedule you are, Anthony."*

- **Resource Labels** = **R**andom **E**mployees **S**acrificed **O**nly **U**ntil **R**eality **C**auses **E**xhaustion
  *The tiny text next to the bar where we officially document exactly who will be taking the fall during the project post-mortem.*

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
