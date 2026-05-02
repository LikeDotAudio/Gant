/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Defines the public API for the application, exposing functions to the UI layer and coordinating with core modules.
 */

import { state } from './state.js';
import { el } from './elements.js';
import { render } from './render.js';
import { updateNav } from './worker-client.js';
import { showStatus } from '../utils/status.js';
import { persistState, loadFromPath } from '../utils/persistence.js';
import { getStickyWidthPx } from '../utils/layout.js';
import * as gantt from '../Rows/index.js';
import * as timeline from '../timeline/index.js';
import * as columns from '../columns/index.js';
import * as file from '../file/index.js';
import * as pb from '../progressbar/index.js';
import { renderSpreadsheet } from '../views/spreadsheet.js';
import { renderPrinterView } from '../views/printer.js';
import { renderJSONView, parseJSONView } from '../views/json-view.js';

const { fold, manager: cols } = columns;
const { milestones } = timeline;

/**
 * Initializes the global window.app object.
 * This global object acts as the primary interface for UI-bound events (like button clicks)
 * to interact with the internal state, file system, and rendering engine.
 */
export function initAppAPI() {
    window.app = {
        /**
         * Triggers the file selection dialog and processes the loaded file.
         */
        async openDir() {
            try { await file.load.openFile(state, el, render, showStatus); } 
            catch (err) { console.error("openFile error:", err); showStatus(err.message, true); }
        },
        /**
         * Saves current changes back to the original file handle, or prompts for a save path if none exists.
         */
        async saveFile() { await file.save.saveFile(state, showStatus, (s, st) => file.save.saveFileAs(s, el, st)); },
        /**
         * Prompts the user for a location to save the project file.
         */
        async saveFileAs() { await file.save.saveFileAs(state, el, showStatus); },
        /**
         * Exports project task data to a CSV format file.
         */
        async exportCSV() { await file.saveCSV(state.projectData, showStatus); },
        /**
         * Imports project task data from a CSV format file into the state.
         */
        async importCSV() { await file.loadCSV(state, render, showStatus); },
        
        /**
         * Resets the current application state to a fresh, default Gantt project template.
         */
        newFile() {
            state.currentFileHandle = null;
            state.projectData = {
                project: "New Project",
                baseDate: new Date().toISOString().split('T')[0],
                roots: [{ RootID: "1", name: "New Root Task", progress: 0, type: "summary", parents: [] }],
                milestones: []
            };
            state.foldedIds.clear();
            state.selectedTaskFullId = null;
            el.activeFilename.innerText = "Unsaved Project";
            renderJSONView(state.projectData, el.jsonEditor);
            render();
            showStatus("New project created.");
        },

        /**
         * Switches the application UI view mode.
         * @param {string} view - The name of the view to switch to (visual, spreadsheet, printer, json).
         */
        setView(view) {
            const oldView = state.currentView;
            state.currentView = view;
            // Toggle visibility classes for container divs
            ['visual', 'spreadsheet', 'printer', 'json'].forEach(v => {
                const div = document.getElementById(`view-${v}`);
                if (div) div.classList.toggle('active', v === view);
            });

            // Cleanup function for the previous view, ensuring no stale DOM or unparsed data remains.
            if (oldView === 'json' && view !== 'json') {
                const data = parseJSONView(el.jsonEditor.value);
                if (data) state.projectData = data;
                el.jsonEditor.value = '';
            } else if (oldView === 'visual' && view !== 'visual') {
                el.ganttChart.innerHTML = '';
            } else if (oldView === 'spreadsheet' && view !== 'spreadsheet') {
                const ssDiv = document.getElementById('view-spreadsheet');
                if (ssDiv) ssDiv.innerHTML = '';
            } else if (oldView === 'printer' && view !== 'printer') {
                const prDiv = document.getElementById('view-printer');
                if (prDiv) prDiv.innerHTML = '';
            }

            // Re-render the newly selected view.
            if (view === 'json') renderJSONView(state.projectData, el.jsonEditor);
            else if (view === 'spreadsheet') renderSpreadsheet(state.projectData, document.getElementById('view-spreadsheet'), state.flatTasks);
            else if (view === 'printer') renderPrinterView(state.projectData, document.getElementById('view-printer'));
            else render();
        },
        
        /**
         * Triggers a UI confirmation dialog for deleting the currently selected task.
         */
        confirmDeleteSelected() {
            if (!state.selectedTaskFullId) { showStatus("No task selected.", true); return; }
            const task = gantt.findTask(state.projectData.roots, state.selectedTaskFullId);
            if (!task) return;
            el.statusText.style.display = 'none';
            el.confirmDel.style.display = 'flex';
            el.delPrompt.innerText = `Delete "${task.name}"?`;
            el.delYes.onclick = () => {
                const result = gantt.del.deleteTask(state.projectData.roots, state.selectedTaskFullId);
                if (result.changed) {
                    state.selectedTaskFullId = null;
                    gantt.refreshIds(state.projectData.roots);
                    render(true);
                    showStatus(`Deleted ${result.name}`);
                    persistState(true); // Immediate save to prevent data loss on destructive operation.
                }
            };
        },
        
        /**
         * Toggles the selection status of a task based on its unique fullId.
         * @param {string} fullId - The full path-based ID of the task.
         */
        selectTask(fullId) { state.selectedTaskFullId = (state.selectedTaskFullId === fullId) ? null : fullId; render(); },
        /**
         * Toggles the fold/unfold state of a summary task.
         * @param {string} fullId - The full path-based ID of the summary task.
         * @param {Event} e - Optional click event to prevent propagation.
         */
        toggleFold(fullId, e) { if (e) e.stopPropagation(); fold.toggleItem(state.foldedIds, fullId); render(); },
        /**
         * Folds all tasks in the project to a specific hierarchical depth.
         * @param {number} depth - The hierarchical level to fold up to.
         */
        foldToLevel(depth) { fold.foldToLevel(state.projectData.roots, state.foldedIds, depth); render(); },
        
        /**
         * Inserts a new task above the currently selected task.
         */
        addAbove() {
            if (!state.selectedTaskFullId) { showStatus("No task selected.", true); return; }
            const taskToTrack = gantt.findTask(state.projectData.roots, state.selectedTaskFullId);
            const result = gantt.add.addAbove(state.projectData.roots, state.selectedTaskFullId);
            if (result.changed) {
                gantt.refreshIds(state.projectData.roots);
                state.selectedTaskFullId = gantt.findFullId(state.projectData.roots, taskToTrack);
                render(true); showStatus(`Added task above.`); persistState();
            }
        },

        /**
         * Inserts a new task below the currently selected task.
         */
        addBelow() {
            if (!state.selectedTaskFullId) { showStatus("No task selected.", true); return; }
            const taskToTrack = gantt.findTask(state.projectData.roots, state.selectedTaskFullId);
            const result = gantt.add.addBelow(state.projectData.roots, state.selectedTaskFullId);
            if (result.changed) {
                gantt.refreshIds(state.projectData.roots);
                state.selectedTaskFullId = gantt.findFullId(state.projectData.roots, taskToTrack);
                render(true); showStatus(`Added task below.`); persistState();
            }
        },

        /**
         * Initiates the drag operation for reordering rows.
         */
        rowDragStart(e, fullId) { state.draggedRowFullId = fullId; e.target.classList.add('dragging'); },
        /**
         * Handles the drag-over event for rows, providing visual feedback.
         */
        rowDragOver(e) { e.preventDefault(); const row = e.target.closest('.gantt-row'); if (row) row.classList.add('drag-over'); },
        /**
         * Handles the drag-leave event for rows, removing visual feedback.
         */
        rowDragLeave(e) { const row = e.target.closest('.gantt-row'); if (row) row.classList.remove('drag-over'); },
        /**
         * Handles the dropping of a row to change hierarchy or order.
         * Logic moves the dragged task into the target task's children (as a new sub-task).
         */
        rowDrop(e, targetFullId) {
            e.preventDefault();
            const row = e.target.closest('.gantt-row'); if (row) row.classList.remove('drag-over');
            if (!state.draggedRowFullId || state.draggedRowFullId === targetFullId) return;
            const { parent: oldP, index: oldIdx } = gantt.findParentAndIndex(state.projectData.roots, state.draggedRowFullId);
            const [task] = oldP.children.splice(oldIdx, 1);
            const target = gantt.findTask(state.projectData.roots, targetFullId);
            let targetChildren = gantt.getChildren(target);
            if (!targetChildren) { targetChildren = []; gantt.setChildren(target, targetChildren); target.type = "summary"; }
            targetChildren.push(task);
            gantt.refreshIds(state.projectData.roots);
            state.selectedTaskFullId = gantt.findFullId(state.projectData.roots, task);
            render(true); persistState();
        },

        /**
         * Initiates drag/resize operations for task progress bars.
         */
        startBarDrag(e, fullId, mode) { pb.startBarDrag(e, fullId, mode, state, render); },
        /**
         * Opens the editing interface for a specific task.
         */
        editTask(fullId, e) { pb.editBar(fullId, state.projectData, el, render); },
        /**
         * Initiates drag for project milestones.
         */
        startMilestoneDrag(e, index) { milestones.startMilestoneDrag(e, index, state.projectData, state.zoomLevel, render); },
        /**
         * Adds a new milestone to the timeline.
         */
        addMilestone(e, minDateStr) { milestones.addMilestone(e, minDateStr, state.projectData, state.zoomLevel, el, render); },
        /**
         * Zooms the Gantt chart view by modifying the zoomLevel state.
         * @param {number} delta - Amount to change the zoom level by.
         */
        zoom(delta) { state.zoomLevel = Math.max(10, Math.min(200, state.zoomLevel + delta)); render(); if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel); },
        /**
         * Adjusts zoom level automatically to fit the entire project range within the current viewport.
         */
        zoomFit() {
            const container = document.getElementById('gantt-container');
            if (!container || !state.projectMin || !state.projectMax) return;
            const totalDays = Math.ceil((new Date(state.projectMax + 'T00:00:00') - new Date(state.projectMin + 'T00:00:00')) / 86400000);
            if (totalDays <= 0) return;
            const timelineWidth = container.clientWidth - getStickyWidthPx();
            if (timelineWidth > 50) {
                state.zoomLevel = Math.max(10, Math.min(200, Math.floor(timelineWidth / totalDays)));
                render(); if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel);
            }
        },
        /**
         * Toggles the visibility of specific Gantt chart columns.
         */
        toggleCol(col, checked) { cols.toggleCol(col, checked); },
        /**
         * Re-renders the navigation panel.
         */
        renderNavigator() { if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel); },
        /**
         * Initiates column width resizing.
         * Adds mouse movement listeners to the body to track resizing until the mouse is released.
         */
        startColResize(e, col) {
            e.preventDefault(); e.stopPropagation(); state.isResizingCol = true;
            const startX = e.clientX; const startWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--${col}-w`)) || 0;
            const onMouseMove = (me) => {
                document.documentElement.style.setProperty(`--${col}-w`, `${Math.max(10, startWidth + (me.clientX - startX))}px`);
                render(false); if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel);
            };
            const onMouseUp = () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); document.body.style.cursor = 'default'; };
            window.addEventListener('mousemove', onMouseMove, { passive: true }); window.addEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'col-resize';
        },
        /**
         * Loads project file from a pre-determined or remembered path.
         */
        loadFromPath() { loadFromPath(render); },
        /**
         * Updates a task property in the data and triggers a re-render.
         * @param {string} fullId - Full ID of the target task.
         * @param {string} field - Property name to update.
         * @param {any} value - New value to set.
         */
        updateTask(fullId, field, value) {
            const task = gantt.findTask(state.projectData.roots, fullId); if (!task) return;
            if (field === 'start') task.start = value;
            else if (field === 'progress') task.progress = parseInt(value) || 0;
            else if (field === 'duration') task.duration = parseFloat(value) || 0;

            else if (field === 'end') {
                const flatTask = state.flatTasks.find(ft => ft.fullId === fullId);
                if (flatTask) {
                    const sDate = new Date(flatTask.calculatedStart); const eDate = new Date(value);
                    task.duration = Math.max(0, Math.ceil((eDate - sDate) / 86400000));
                }
            } else { task[field] = value; }
            render(); persistState();
        }
    };
}
