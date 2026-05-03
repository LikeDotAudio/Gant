/**
 * js/actions/keyboard/navigateKeyboard.js
 * Handles vertical keyboard navigation between tasks in the Gantt list.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';

/**
 * Monitors for ArrowUp and ArrowDown keys to navigate the selection through the flat task list.
 * Supports wrapping around the top and bottom of the list.
 * 
 * @param {KeyboardEvent} keyboardEvent - The browser's native keyboard event.
 * @returns {boolean} - Returns true if the navigation was handled.
 */
export function navigateKeyboard(keyboardEvent) {
    const isUp = keyboardEvent.key === 'ArrowUp';
    const isDown = keyboardEvent.key === 'ArrowDown';

    if (!isUp && !isDown) {
        return false;
    }

    // Prevent default browser scrolling when navigating the chart
    keyboardEvent.preventDefault();

    const flatTaskList = state.flatTasks;
    if (!flatTaskList || flatTaskList.length === 0) {
        return true;
    }
    
    let targetIndex = 0;
    const selectedTaskIdsCount = state.selectedTaskFullIds.size;

    if (selectedTaskIdsCount > 0) {
        // Find the index of the most recently selected task
        const selectedIdsArray = Array.from(state.selectedTaskFullIds);
        const lastSelectedFullId = selectedIdsArray[selectedIdsArray.length - 1];
        
        const currentSelectedTaskIndex = flatTaskList.findIndex(task => task.fullId === lastSelectedFullId);
        
        if (isUp) {
            // Move up with wrap-around logic
            targetIndex = (currentSelectedTaskIndex - 1 + flatTaskList.length) % flatTaskList.length;
        } else {
            // Move down with wrap-around logic
            targetIndex = (currentSelectedTaskIndex + 1) % flatTaskList.length;
        }
    }

    // Update state with the new single selection
    state.selectedTaskFullIds.clear();
    const targetTask = flatTaskList[targetIndex];
    if (targetTask) {
        state.selectedTaskFullIds.add(targetTask.fullId);
    }
    
    // Perform a shallow render to update selection highlighting
    render(false); 
    
    return true;
}
