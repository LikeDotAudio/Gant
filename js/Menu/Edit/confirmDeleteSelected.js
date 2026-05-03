import { state } from '../../core/state.js';
import { el } from '../../core/elements.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import { persistState } from '../../utils/persistence.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';

export function confirmDeleteSelected() {
    if (state.selectedTaskFullIds.size === 0) { showStatus("No task selected.", true); return; }
    const fullId = Array.from(state.selectedTaskFullIds)[0];
    const task = gantt.findTask(state.projectData.roots, fullId);
    if (!task) return;
    el.statusText.style.display = 'none';
    el.confirmDel.style.display = 'flex';
    el.delPrompt.innerText = `Delete "${task.name}"?`;

    const cleanup = () => {
        el.confirmDel.style.display = 'none';
        window.removeEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            el.delYes.click();
        } else if (e.key === 'Escape') {
            el.delNo.click();
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    el.delYes.onclick = () => {
        undoManager.pushState();
        const result = gantt.del.deleteTask(state.projectData.roots, fullId);
        if (result.changed) {
            state.selectedTaskFullIds.clear();
            gantt.refreshIds(state.projectData.roots);
            render(true);
            showStatus(`Deleted ${result.name}`);
            persistState(true);
            cleanup();
        }
    };
    el.delNo.onclick = () => {
        el.statusText.style.display = 'block';
        showStatus("Delete cancelled.");
        cleanup();
    };
}
