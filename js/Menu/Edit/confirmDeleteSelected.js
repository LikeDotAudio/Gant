/**
 * js/Menu/Edit/confirmDeleteSelected.js
 * Handles the confirmation dialog and logic for deleting the currently selected task.
 */

import { state } from '../../core/state.js';
import { el as elements } from '../../core/elements.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import { persistState } from '../../utils/persistence.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Initiates the deletion process for the selected task, displaying a confirmation prompt.
 * It manages keyboard listeners for confirmation/cancellation and updates the project state upon deletion.
 * 
 * @returns {void}
 */
export function confirmDeleteSelected() {
    if (state.selectedTaskFullIds.size === 0) { 
        showStatus("No task selected.", true); 
        return; 
    }
    const fullId = Array.from(state.selectedTaskFullIds)[0];
    const task = gantt.findTask(state.projectData.roots, fullId);
    if (!task) return;
    
    elements.statusText.style.display = 'none';
    elements.confirmDel.style.display = 'flex';
    elements.delPrompt.innerText = `Delete "${task.name}"?`;

    /**
     * Cleans up the confirmation UI and event listeners.
     */
    const cleanup = () => {
        elements.confirmDel.style.display = 'none';
        window.removeEventListener('keydown', handleKeyDown);
    };

    /**
     * Handles keyboard events for the confirmation dialog.
     * @param {KeyboardEvent} keyboardEvent - The keyboard event.
     */
    const handleKeyDown = (keyboardEvent) => {
        if (keyboardEvent.key === 'Enter') {
            elements.delYes.click();
        } else if (keyboardEvent.key === 'Escape') {
            elements.delNo.click();
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    elements.delYes.onclick = () => {
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
    elements.delNo.onclick = () => {
        elements.statusText.style.display = 'block';
        showStatus("Delete cancelled.");
        cleanup();
    };
}
