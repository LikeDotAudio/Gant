import { state } from './state.js';
import { el } from './elements.js';
import { render, getCurrentRequestId, setWorker } from './render.js';
import { showStatus } from '../utils/status.js';
import { autoZoom, calculateTaskNameWidth } from '../utils/layout.js';
import * as timeline from '../timeline/index.js';
const worker = new Worker('js/worker.js?cb=' + Date.now(), { type: 'module' });
setWorker(worker);
let firstLoad = true;
let updateNav = null;
worker.onmessage = (e) => {
    const { action, result, requestId, error } = e.data;
    if (requestId && requestId < getCurrentRequestId()) return;
    if (error) {
        showStatus("Worker error: " + error, true);
        return;
    }
    if (action === 'flattened') {
        state.flatTasks = result.flat;
        state.projectMin = result.min;
        state.projectMax = result.max;
        if (firstLoad && state.flatTasks.length > 0) {
            autoZoom();
            firstLoad = false;
        }
        if (!state.isResizingCol) {
            const nameW = calculateTaskNameWidth(state.flatTasks);
            document.documentElement.style.setProperty('--name-w', `${nameW}px`);
        }
        timeline.renderGantt(state.projectData, state.zoomLevel, state.foldedIds, state.selectedTaskFullIds, el.ganttChart, state.flatTasks, true, state.projectMin, state.projectMax);
        if (!updateNav && state.flatTasks.length > 0) {
            const container = document.getElementById('gantt-container');
            updateNav = timeline.initNavigator(container, el.ganttChart);
        }
        if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel);
    } else if (action === 'refreshed') {
        state.projectData.roots = result;
        render(true);
    }
};
export { worker, updateNav };
