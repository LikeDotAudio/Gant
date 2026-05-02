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

export function initAppAPI() {
    window.app = {
        async openDir() {
            try { await file.load.openFile(state, el, render, showStatus); } 
            catch (err) { console.error("openFile error:", err); showStatus(err.message, true); }
        },
        async saveFile() { await file.save.saveFile(state, showStatus, (s, st) => file.save.saveFileAs(s, el, st)); },
        async saveFileAs() { await file.save.saveFileAs(state, el, showStatus); },
        async exportCSV() { await file.saveCSV(state.projectData, showStatus); },
        async importCSV() { await file.loadCSV(state, render, showStatus); },
        
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

        setView(view) {
            const oldView = state.currentView;
            state.currentView = view;
            ['visual', 'spreadsheet', 'printer', 'json'].forEach(v => {
                const div = document.getElementById(`view-${v}`);
                if (div) div.classList.toggle('active', v === view);
            });

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

            if (view === 'json') renderJSONView(state.projectData, el.jsonEditor);
            else if (view === 'spreadsheet') renderSpreadsheet(state.projectData, document.getElementById('view-spreadsheet'), state.flatTasks);
            else if (view === 'printer') renderPrinterView(state.projectData, document.getElementById('view-printer'));
            else render();
        },
        
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
                    persistState(true);
                }
            };
        },
        
        selectTask(fullId) { state.selectedTaskFullId = (state.selectedTaskFullId === fullId) ? null : fullId; render(); },
        toggleFold(fullId, e) { if (e) e.stopPropagation(); fold.toggleItem(state.foldedIds, fullId); render(); },
        foldToLevel(depth) { fold.foldToLevel(state.projectData.roots, state.foldedIds, depth); render(); },
        
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

        rowDragStart(e, fullId) { state.draggedRowFullId = fullId; e.target.classList.add('dragging'); },
        rowDragOver(e) { e.preventDefault(); const row = e.target.closest('.gantt-row'); if (row) row.classList.add('drag-over'); },
        rowDragLeave(e) { const row = e.target.closest('.gantt-row'); if (row) row.classList.remove('drag-over'); },
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

        startBarDrag(e, fullId, mode) { pb.startBarDrag(e, fullId, mode, state, render); },
        editTask(fullId, e) { pb.editBar(fullId, state.projectData, el, render); },
        startMilestoneDrag(e, index) { milestones.startMilestoneDrag(e, index, state.projectData, state.zoomLevel, render); },
        addMilestone(e, minDateStr) { milestones.addMilestone(e, minDateStr, state.projectData, state.zoomLevel, el, render); },
        zoom(delta) { state.zoomLevel = Math.max(10, Math.min(200, state.zoomLevel + delta)); render(); if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel); },
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
        toggleCol(col, checked) { cols.toggleCol(col, checked); },
        renderNavigator() { if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel); },
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
        loadFromPath() { loadFromPath(render); },
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
