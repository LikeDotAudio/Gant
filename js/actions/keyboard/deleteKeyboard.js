/**
 * js/actions/keyboard/deleteKeyboard.js
 * Handles the keyboard shortcut for deleting selected tasks.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import { persistState } from '../../utils/persistence.js';
import { undoManager } from '../../Undo/manager.js';
import * as gantt from '../../Rows/index.js';

/**
 * Monitors for the 'Delete' key to remove currently selected tasks from the project.
 * 
 * @param {KeyboardEvent} keyboardEvent - The browser's native keyboard event.
 * @returns {boolean} - Returns true if the delete action was handled.
 */
export function deleteKeyboard(keyboardEvent) {
    if (keyboardEvent.key !== 'Delete') {
        return false;
    }

    if (state.selectedTaskFullIds.size > 0) {
        keyboardEvent.preventDefault();
        
        undoManager.pushState();
        
        const selectedFullIds = Array.from(state.selectedTaskFullIds);
        let successfullyDeletedCount = 0;
        let mostRecentDeletedTaskName = "";

        // Iterate through all selected tasks and attempt deletion
        selectedFullIds.forEach(targetFullId => {
            const deletionResult = gantt.del.deleteTask(state.projectData.roots, targetFullId);
            if (deletionResult.changed) {
                successfullyDeletedCount++;
                mostRecentDeletedTaskName = deletionResult.name;
            }
        });

        if (successfullyDeletedCount > 0) {
            state.selectedTaskFullIds.clear();
            gantt.refreshIds(state.projectData.roots);
            render(true);
            
            const statusMessage = successfullyDeletedCount === 1 
                ? `Deleted ${mostRecentDeletedTaskName}` 
                : `Deleted ${successfullyDeletedCount} tasks`;
            
            showStatus(statusMessage);
            persistState(true);
        }
        
        return true;
    }

    return false;
}
