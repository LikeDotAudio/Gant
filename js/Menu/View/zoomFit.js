import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { updateNav } from '../../core/clientWorker.js';
import { getStickyWidthPx } from '../../utils/layout.js';

export function zoomFit() {
    const container = document.getElementById('gantt-container');
    if (!container || !state.projectMin || !state.projectMax) return;
    const totalDays = Math.ceil((new Date(state.projectMax + 'T00:00:00') - new Date(state.projectMin + 'T00:00:00')) / 86400000);
    if (totalDays <= 0) return;
    const timelineWidth = container.clientWidth - getStickyWidthPx();
    if (timelineWidth > 50) {
        state.zoomLevel = Math.max(10, Math.min(200, Math.floor(timelineWidth / totalDays)));
        render(); 
        if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel);
    }
}
