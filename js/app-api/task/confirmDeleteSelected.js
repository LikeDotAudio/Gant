import { state } from '../../core/state.js';
import { el } from '../../core/elements.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../utils/status.js';
import { persistState } from '../../utils/persistence.js';
import * as gantt from '../../Rows/index.js';

export function confirmDeleteSelected() {
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
}
