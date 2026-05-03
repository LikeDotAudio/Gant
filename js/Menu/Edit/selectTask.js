/**
 * js/Menu/Edit/selectTask.js
 * Handles task selection logic, including multi-select via modifier keys.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';

/**
 * Updates the application's selection state for tasks.
 * Supports single selection and toggling multiple selections using Ctrl/Cmd.
 * 
 * @param {string} taskFullId - The dot-notated full ID of the task to select.
 * @param {MouseEvent|KeyboardEvent} interactionEvent - The event that triggered the selection.
 */
export function selectTask(taskFullId, interactionEvent) { 
    console.log(`[State] Task selection requested`, { taskFullId });

    const isModifierKeyPressed = interactionEvent.ctrlKey || interactionEvent.metaKey;

    if (!isModifierKeyPressed) {
        // Standard click: Clear previous selection and select only the current task.
        state.selectedTaskFullIds.clear();
        if (taskFullId) {
            state.selectedTaskFullIds.add(taskFullId);
        }
    } else {
        // Multi-select mode: Toggle the selection state for the specific task.
        if (state.selectedTaskFullIds.has(taskFullId)) {
            state.selectedTaskFullIds.delete(taskFullId);
        } else {
            if (taskFullId) {
                state.selectedTaskFullIds.add(taskFullId);
            }
        }
    }

    // Refresh the view to show updated selection highlighting
    render(); 
}
