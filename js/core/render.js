import { state } from './state.js';
import { el } from './elements.js';
import { showStatus } from '../StatusBar/Status_update.js';
import * as timeline from '../timeline/index.js'; 
import { renderSpreadsheet } from '../views/spreadsheet.js';
import { renderPrinterView } from '../views/printer.js';
import { renderMindMap } from '../views/mindmap.js';

// Web worker reference for offloading expensive layout calculations.
let workerRef = null;
export function setWorker(w) { workerRef = workerRef || w; }
let currentRequestId = 0;
export function getCurrentRequestId() { return currentRequestId; }
export function incrementRequestId() { return ++currentRequestId; }
// Main entry point for updating the screen.
// updateFlat triggers a fresh layout calculation via the web worker.
export function render(updateFlat = true) {
    console.log(`[render] Visual frame update`, { view: state.currentView, updateFlat });
    try {
        if (state.currentView === 'visual') {
            if (updateFlat) {
                // Flattening is expensive; offload to worker to keep UI responsive.
                const requestId = incrementRequestId();
                workerRef.postMessage({ 
                    action: 'flatten', 
                    payload: { 
                        roots: state.projectData.roots, 
                        options: { baseDate: state.projectData.baseDate, foldedIds: state.foldedIds },
                        requestId 
                    } 
                });
            } else {
                // If flattening isn't required (e.g. scrolling), just re-render the viewable window.
                timeline.renderGantt(state.projectData, state.zoomLevel, state.foldedIds, state.selectedTaskFullIds, el.ganttChart, state.flatTasks, false, state.projectMin, state.projectMax);
            }
        } else if (state.currentView === 'spreadsheet') {
            renderSpreadsheet(state.projectData, document.getElementById('view-spreadsheet'));
        } else if (state.currentView === 'printer') {
            renderPrinterView(state.projectData, document.getElementById('view-printer'));
        } else if (state.currentView === 'mindmap') {
            renderMindMap(state.projectData, document.getElementById('view-mindmap'), state.flatTasks);
        }
        
        // Update status bar with selection details
        if (state.selectedTaskFullIds.size > 0) {
            const count = state.selectedTaskFullIds.size;
            const ids = Array.from(state.selectedTaskFullIds).join(', ');
            showStatus(`Selected: ${count} task(s) - IDs: ${ids}`);
        } else {
            showStatus("System Ready.");
        }
    } catch (err) {
        console.error("Render error:", err);
        showStatus("Render error: " + err.message, true);
    }
}
