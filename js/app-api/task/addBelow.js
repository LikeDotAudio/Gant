import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/Status_update.js';
import { persistState } from '../../utils/persistence.js';
import * as gantt from '../../Rows/index.js';

export function addBelow() {
    if (state.selectedTaskFullIds.size === 0) { showStatus("No task selected.", true); return; }
    const selectedId = Array.from(state.selectedTaskFullIds)[0];
    const taskToTrack = gantt.findTask(state.projectData.roots, selectedId);
    const result = gantt.add.addBelow(state.projectData.roots, selectedId);
    if (result.changed) {
        gantt.refreshIds(state.projectData.roots);
        const newId = gantt.findFullId(state.projectData.roots, taskToTrack);
        state.selectedTaskFullIds.clear();
        state.selectedTaskFullIds.add(newId);
        render(true); showStatus(`Added task below.`); persistState();
    }
}
