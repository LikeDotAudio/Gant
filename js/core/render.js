import { state } from './state.js';
import { el } from './elements.js';
import { showStatus } from '../utils/status.js';
import * as timeline from '../timeline/index.js'; 
import { renderSpreadsheet } from '../views/spreadsheet.js';
import { renderPrinterView } from '../views/printer.js';

// We'll need to export the render function and a way to set the worker
let workerRef = null;
export function setWorker(w) { workerRef = workerRef || w; }

let currentRequestId = 0;
export function getCurrentRequestId() { return currentRequestId; }
export function incrementRequestId() { return ++currentRequestId; }

export function render(updateFlat = true) {
    try {
        if (state.currentView === 'visual') {
            if (updateFlat) {
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
