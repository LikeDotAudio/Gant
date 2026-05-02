import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../utils/status.js';
import { persistState } from '../../utils/persistence.js';
import * as gantt from '../../Rows/index.js';

export function addAbove() {
    if (!state.selectedTaskFullId) { showStatus("No task selected.", true); return; }
    const taskToTrack = gantt.findTask(state.projectData.roots, state.selectedTaskFullId);
    const result = gantt.add.addAbove(state.projectData.roots, state.selectedTaskFullId);
    if (result.changed) {
        gantt.refreshIds(state.projectData.roots);
        state.selectedTaskFullId = gantt.findFullId(state.projectData.roots, taskToTrack);
        render(true); showStatus(`Added task above.`); persistState();
    }
}
