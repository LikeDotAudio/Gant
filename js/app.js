import * as fs from './file-system.js';
import * as gantt from './gantt.js';
import { renderGantt } from './renderer.js';
import * as move from './MoveItem.js';
import * as fold from './FoldTree.js';
import * as add from './AddLine.js';
import * as del from './Delete.js';

import * as cols from './columns.js';
import * as ms from './milestones.js';
import * as pb from './progressbar.js';
import * as fLoad from './file-load.js';
import * as fSave from './file-save.js';

import { renderSpreadsheet } from './spreadsheet.js';
import { loadCSV } from './file-load-csv.js';
import { saveCSV } from './file-save-csv.js';

// Initialize Web Worker
const worker = new Worker('js/worker.js', { type: 'module' });
let currentRequestId = 0;

worker.onmessage = (e) => {
    const { action, result, requestId, error } = e.data;
    if (requestId && requestId < currentRequestId) return;

    if (error) {
        showStatus("Worker error: " + error, true);
        return;
    }

    if (action === 'flattened') {
        state.flatTasks = result.flat;
        state.projectMin = result.min;
        state.projectMax = result.max;
        renderGantt(state.projectData, state.zoomLevel, state.foldedIds, state.selectedTaskFullId, el.ganttChart, state.flatTasks, true, state.projectMin, state.projectMax);
    }
 else if (action === 'refreshed') {
        state.projectData.roots = result;
        render(true);
    }
};

// Central State
const state = {
    currentFileHandle: null,
    projectData: { roots: [], baseDate: new Date().toISOString().split('T')[0] },
    flatTasks: [], // Cached flattened tasks
    foldedIds: new Set(),
    selectedTaskFullId: null,
    zoomLevel: 70,
    dragMode: null,
    draggedTask: null,
    draggedRowFullId: null,
    currentView: 'visual'
};

const el = {
    btnOpenDir: document.getElementById('btnOpenDir'), 
    btnSaveFile: document.getElementById('btnSaveFile'),
    jsonEditor: document.getElementById('json-editor'),
    activeFilename: document.getElementById('active-filename'), 
    status: document.getElementById('status'),
    statusText: document.getElementById('status-text'),
    ganttChart: document.getElementById('gantt-chart'), 
    overlay: document.getElementById('overlay'), 
    overlayInput: document.getElementById('overlay-input'),
    overlayProgress: document.getElementById('overlay-progress'), 
    overlayColor: document.getElementById('overlay-color'),
    overlayTitle: document.getElementById('overlay-title'), 
    overlayOk: document.getElementById('overlay-ok'),
    overlayCancel: document.getElementById('overlay-cancel'),
    confirmDel: document.getElementById('confirm-del'),
    delPrompt: document.getElementById('del-prompt'),
    delYes: document.getElementById('del-yes'),
    delNo: document.getElementById('del-no')
};

function showStatus(msg, isError = false) {
    if (!el.statusText) return;
    el.statusText.innerText = msg;
    el.status.className = isError ? 'error' : '';
    el.statusText.style.display = 'block';
    el.confirmDel.style.display = 'none';
}

function render(updateFlat = true) {
    try {
        if (state.currentView === 'visual') {
            if (updateFlat) {
                const requestId = ++currentRequestId;
                worker.postMessage({ 
                    action: 'flatten', 
                    payload: { 
                        roots: state.projectData.roots, 
                        options: { baseDate: state.projectData.baseDate, foldedIds: state.foldedIds },
                        requestId 
                    } 
                });
            } else {
                renderGantt(state.projectData, state.zoomLevel, state.foldedIds, state.selectedTaskFullId, el.ganttChart, state.flatTasks, false, state.projectMin, state.projectMax);
            }
        } else if (state.currentView === 'spreadsheet') {
            renderSpreadsheet(state.projectData, document.getElementById('view-spreadsheet'));
        }
    } catch (err) {
        console.error("Render error:", err);
        showStatus("Render error: " + err.message, true);
    }
}

function setupEventListeners() {
    window.addEventListener('keydown', handleKeyboard);
    el.overlayCancel.onclick = () => { el.overlay.style.display = 'none'; };
    el.overlayProgress.oninput = () => {
        const valSpan = document.getElementById('progress-val');
        if (valSpan) valSpan.innerText = `${el.overlayProgress.value}%`;
    };
    el.delNo.onclick = () => showStatus("Delete cancelled.");

    // Central Event Delegation for Gantt Chart
    if (el.ganttChart) {
        const container = document.getElementById('gantt-container');
        if (container) {
            let scrollTimeout;
            container.addEventListener('scroll', () => {
                if (state.currentView === 'visual') {
                    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
                    scrollTimeout = requestAnimationFrame(() => render(false));
                }
            }, { passive: true });
        }

        el.ganttChart.addEventListener('click', handleGanttClick);
        el.ganttChart.addEventListener('change', handleGanttChange);
        el.ganttChart.addEventListener('mousedown', handleGanttMouseDown);
        el.ganttChart.addEventListener('dblclick', handleGanttDblClick);
        
        // Drag and Drop reordering
        el.ganttChart.addEventListener('dragstart', handleGanttDragStart);
        el.ganttChart.addEventListener('dragover', handleGanttDragOver);
        el.ganttChart.addEventListener('dragleave', handleGanttDragLeave);
        el.ganttChart.addEventListener('drop', handleGanttDrop);
        
        // Prevent row drag when on bar
        el.ganttChart.addEventListener('mouseover', (e) => {
            const bar = e.target.closest('.bar');
            if (bar) {
                const row = bar.closest('.gantt-row');
                if (row) row.draggable = false;
            }
        });
        el.ganttChart.addEventListener('mouseout', (e) => {
            const bar = e.target.closest('.bar');
            if (bar) {
                const row = bar.closest('.gantt-row');
                if (row) row.draggable = true;
            }
        });
    }
}

function handleGanttClick(e) {
    const target = e.target;
    const actionEl = target.dataset.action ? target : target.closest('[data-action]');
    const action = actionEl?.dataset.action;
    const id = actionEl?.dataset.id || target.closest('[data-id]')?.dataset.id;
    
    if (!action) return;

    switch (action) {
        case 'toggleFold':
            window.app.toggleFold(id, e);
            break;
        case 'selectTask':
            window.app.selectTask(id);
            break;
        case 'editTask':
        case 'editColor':
            window.app.editTask(id, e);
            break;
        case 'addMilestone':
            window.app.addMilestone(e, actionEl.dataset.minDate);
            break;
    }
}

function handleGanttChange(e) {
    const target = e.target;
    const actionEl = target.dataset.action ? target : target.closest('[data-action]');
    if (actionEl && actionEl.dataset.action === 'updateTask') {
        window.app.updateTask(actionEl.dataset.id, actionEl.dataset.field, target.value);
    }
}

function handleGanttMouseDown(e) {
    const target = e.target;
    const actionEl = target.dataset.action ? target : target.closest('[data-action]');
    const action = actionEl?.dataset.action;
    const id = actionEl?.dataset.id || target.closest('[data-id]')?.dataset.id;

    if (action === 'barInteract' || action === 'resize-left' || action === 'resize-right') {
        const mode = action === 'barInteract' ? 'move' : action;
        window.app.startBarDrag(e, id, mode);
    } else if (action === 'milestoneDrag') {
        window.app.startMilestoneDrag(e, parseInt(actionEl.dataset.index));
    }
}

function handleGanttDblClick(e) {
    const row = e.target.closest('.gantt-row');
    const bar = e.target.closest('.bar');
    const id = row?.dataset.id || bar?.dataset.id;
    if (id) {
        window.app.editTask(id, e);
    }
}

function handleGanttDragStart(e) {
    const row = e.target.closest('.gantt-row');
    if (row && row.dataset.id) {
        window.app.rowDragStart(e, row.dataset.id);
    }
}

function handleGanttDragOver(e) {
    window.app.rowDragOver(e);
}

function handleGanttDragLeave(e) {
    window.app.rowDragLeave(e);
}

function handleGanttDrop(e) {
    const row = e.target.closest('.gantt-row');
    if (row && row.dataset.id) {
        window.app.rowDrop(e, row.dataset.id);
    }
}

function handleKeyboard(e) {
    if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
    if (state.currentView !== 'visual') return;

    if (e.key === 'Enter' && state.selectedTaskFullId) {
        window.app.editTask(state.selectedTaskFullId);
        return;
    }

    if (!e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        const flat = state.flatTasks;
        if (!flat || flat.length === 0) return;
        let newIdx = 0;
        if (state.selectedTaskFullId) {
            const currentIdx = flat.findIndex(t => t.fullId === state.selectedTaskFullId);
            if (e.key === 'ArrowUp') newIdx = (currentIdx - 1 + flat.length) % flat.length;
            else newIdx = (currentIdx + 1) % flat.length;
        }
        state.selectedTaskFullId = flat[newIdx].fullId;
        e.preventDefault(); render(false); return;
    }

    if (!e.ctrlKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        if (!state.selectedTaskFullId) return;
        const result = fold.keyboardFold(state.projectData.roots, state.foldedIds, state.selectedTaskFullId, e.key === 'ArrowLeft' ? 'left' : 'right');
        
        if (result.newSelection) {
            state.selectedTaskFullId = result.newSelection;
            e.preventDefault(); render(false);
        } else if (result.changed) {
            e.preventDefault(); render();
        }
        return;
    }

    if (!state.selectedTaskFullId) return;
    const taskToMove = gantt.findTask(state.projectData.roots, state.selectedTaskFullId);
    if (!taskToMove) return;
    const { parent: currentParent, index: currentIndex } = gantt.findParentAndIndex(state.projectData.roots, state.selectedTaskFullId);
    if (!currentParent) return;

    let changed = false;
    if (e.ctrlKey) {
        if (e.key === 'ArrowRight') {
            changed = move.shiftItem(state.projectData.roots, state.selectedTaskFullId, 'right');
        } else if (e.key === 'ArrowLeft') {
            changed = move.shiftItem(state.projectData.roots, state.selectedTaskFullId, 'left');
        } else if (e.key === 'ArrowUp') {
            changed = move.moveUp(state.projectData.roots, state.selectedTaskFullId);
        } else if (e.key === 'ArrowDown') {
            changed = move.moveDown(state.projectData.roots, state.selectedTaskFullId);
        }
    }

    if (changed) {
        e.preventDefault();
        worker.postMessage({ action: 'refreshIds', payload: { roots: state.projectData.roots, requestId: ++currentRequestId } });
        // Note: selectedTaskFullId might change, but we can't easily find it until worker returns.
        // For now, we'll let it be null or stale until next render.
    }
}

// Ensure window.app is defined immediately
window.app = {
    async openDir() { 
        console.log("window.app.openDir triggered");
        try {
            await fLoad.openFile(state, el, render, showStatus); 
        } catch (err) {
            console.error("openFile error:", err);
            showStatus(err.message, true);
        }
    },
    async saveFile() { await fSave.saveFile(state, showStatus, (s, st) => fSave.saveFileAs(s, el, st)); },
    async saveFileAs() { await fSave.saveFileAs(state, el, showStatus); },
    async exportCSV() { await saveCSV(state.projectData, showStatus); },
    async importCSV() { await loadCSV(state, render, showStatus); },
    
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
        el.jsonEditor.value = JSON.stringify(state.projectData, null, 2);
        render();
        showStatus("New project created.");
    },

    setView(view) {
        const oldView = state.currentView;
        state.currentView = view;
        const views = ['visual', 'spreadsheet', 'json'];
        views.forEach(v => {
            const div = document.getElementById(`view-${v}`);
            if (div) div.classList.toggle('active', v === view);
        });

        // Cleanup old view
        if (oldView === 'json' && view !== 'json') {
            try { state.projectData = JSON.parse(el.jsonEditor.value); } catch(e) { console.error("JSON Parse error on view switch:", e); }
            el.jsonEditor.value = ''; // Clear large string
        } else if (oldView === 'visual' && view !== 'visual') {
            el.ganttChart.innerHTML = ''; // Clear DOM nodes
        } else if (oldView === 'spreadsheet' && view !== 'spreadsheet') {
            const ssDiv = document.getElementById('view-spreadsheet');
            if (ssDiv) ssDiv.innerHTML = ''; // Clear DOM nodes
        }

        if (view === 'json') {
            el.jsonEditor.value = JSON.stringify(state.projectData, null, 2);
        } else if (view === 'spreadsheet') {
            renderSpreadsheet(state.projectData, document.getElementById('view-spreadsheet'), state.flatTasks);
        } else {
            render();
        }
    },
    
    confirmDeleteSelected() {
        if (!state.selectedTaskFullId) { showStatus("No task selected.", true); return; }
        const task = gantt.findTask(state.projectData.roots, state.selectedTaskFullId);
        if (!task) return;

        el.statusText.style.display = 'none';
        el.confirmDel.style.display = 'flex';
        el.delPrompt.innerText = `Delete "${task.name}"?`;
        el.delYes.onclick = () => {
            const result = del.deleteTask(state.projectData.roots, state.selectedTaskFullId);
            if (result.changed) {
                state.selectedTaskFullId = null;
                worker.postMessage({ action: 'refreshIds', payload: { roots: state.projectData.roots, requestId: ++currentRequestId } });
                showStatus(`Deleted ${result.name}`);
            }
        };
    },
    
    selectTask(fullId) { state.selectedTaskFullId = (state.selectedTaskFullId === fullId) ? null : fullId; render(); },
    toggleFold(fullId, e) { 
        if (e) e.stopPropagation(); 
        fold.toggleItem(state.foldedIds, fullId); 
        render(); 
    },
    foldToLevel(depth) { 
        fold.foldToLevel(state.projectData.roots, state.foldedIds, depth); 
        render(); 
    },
    
    addAbove() {
        if (!state.selectedTaskFullId) { showStatus("No task selected.", true); return; }
        const result = add.addAbove(state.projectData.roots, state.selectedTaskFullId);
        if (result.changed) {
            worker.postMessage({ action: 'refreshIds', payload: { roots: state.projectData.roots, requestId: ++currentRequestId } });
            showStatus(`Added task above.`);
        }
    },

    addBelow() {
        if (!state.selectedTaskFullId) { showStatus("No task selected.", true); return; }
        const result = add.addBelow(state.projectData.roots, state.selectedTaskFullId);
        if (result.changed) {
            worker.postMessage({ action: 'refreshIds', payload: { roots: state.projectData.roots, requestId: ++currentRequestId } });
            showStatus(`Added task below.`);
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
        worker.postMessage({ action: 'refreshIds', payload: { roots: state.projectData.roots, requestId: ++currentRequestId } });
    },

    startBarDrag(e, fullId, mode) { pb.startBarDrag(e, fullId, mode, state, render); },
    editTask(fullId, e) { pb.editBar(fullId, state.projectData, el, render); },
    startMilestoneDrag(e, index) { ms.startMilestoneDrag(e, index, state.projectData, state.zoomLevel, render); },
    addMilestone(e, minDateStr) { ms.addMilestone(e, minDateStr, state.projectData, state.zoomLevel, el, render); },
    zoom(delta) { state.zoomLevel = Math.max(10, Math.min(200, state.zoomLevel + delta)); render(); },
    toggleCol(col, checked) { cols.toggleCol(col, checked); },
    
    updateTask(fullId, field, value) {
        const task = gantt.findTask(state.projectData.roots, fullId); if (!task) return;
        if (field === 'start') task.start = value;
        else if (field === 'duration') task.duration = parseInt(value) || 0;
        else if (field === 'end') {
            const flatTask = state.flatTasks.find(ft => ft.fullId === fullId);
            if (flatTask) {
                const sDate = new Date(flatTask.calculatedStart); const eDate = new Date(value);
                task.duration = Math.max(0, Math.ceil((eDate - sDate) / 86400000));
            }
        } else { task[field] = value; }
        render();
    }
};

// Initialize after app object is set
try {
    setupEventListeners();
    render();
    console.log("Gantt App initialized successfully.");
} catch (err) {
    console.error("Initialization error:", err);
}
