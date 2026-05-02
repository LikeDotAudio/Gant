import { state } from './state.js';
import { el } from './elements.js';
import { showStatus } from '../utils/status.js';
import * as timeline from '../timeline/index.js'; 
import { renderSpreadsheet } from '../views/spreadsheet.js';
import { renderPrinterView } from '../views/printer.js';
// Web worker reference for offloading expensive layout calculations.
let workerRef = null;
export function setWorker(w) { workerRef = workerRef || w; }
let currentRequestId = 0;
export function getCurrentRequestId() { return currentRequestId; }
export function incrementRequestId() { return ++currentRequestId; }
// Main entry point for updating the screen.
// updateFlat triggers a fresh layout calculation via the web worker.
export function render(updateFlat = true) {
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
                timeline.renderGantt(state.projectData, state.zoomLevel, state.foldedIds, state.selectedTaskFullId, el.ganttChart, state.flatTasks, false, state.projectMin, state.projectMax);
            }
        } else if (state.currentView === 'spreadsheet') {
            renderSpreadsheet(state.projectData, document.getElementById('view-spreadsheet'));
        } else if (state.currentView === 'printer') {
            renderPrinterView(state.projectData, document.getElementById('view-printer'));
        }
    } catch (err) {
        console.error("Render error:", err);
        showStatus("Render error: " + err.message, true);
    }
}
