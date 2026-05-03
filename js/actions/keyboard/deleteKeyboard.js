import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import { persistState } from '../../utils/persistence.js';
import { undoManager } from '../../Undo/manager.js';
import * as gantt from '../../Rows/index.js';

/**
 * Handles the Delete key to perform immediate task deletion.
 * 
 * @param {Event} e - The keyboard event.
 * @returns {boolean} - Whether the event was handled.
 */
export function handleKeyboardDel(e) {
    if (e.key !== 'Delete') return false;

    if (state.selectedTaskFullIds.size > 0) {
        e.preventDefault();
        
        undoManager.pushState();
        
        const fullIds = Array.from(state.selectedTaskFullIds);
        let deletedCount = 0;
        let lastDeletedName = "";

        // Delete all selected tasks
        fullIds.forEach(id => {
            const result = gantt.del.deleteTask(state.projectData.roots, id);
            if (result.changed) {
                deletedCount++;
                lastDeletedName = result.name;
            }
        });

        if (deletedCount > 0) {
            state.selectedTaskFullIds.clear();
            gantt.refreshIds(state.projectData.roots);
            render(true);
            showStatus(deletedCount === 1 ? `Deleted ${lastDeletedName}` : `Deleted ${deletedCount} tasks`);
            persistState(true);
        }
        
        return true;
    }

    return false;
}
