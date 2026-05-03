/**
 * js/actions/keyboard/f2Keyboard.js
 * Handles the F2 keyboard shortcut to initiate task name editing.
 */

import { state } from '../../core/state.js';

/**
 * Triggers the editing interface for the currently selected task when F2 is pressed.
 * 
 * @param {KeyboardEvent} keyboardEvent - The browser's native keyboard event.
 * @returns {boolean} - Returns true if the F2 action was handled.
 */
export function f2Keyboard(keyboardEvent) {
    if (keyboardEvent.key !== 'F2') {
        return false;
    }

    keyboardEvent.preventDefault();

    // Ensure exactly one task is selected for editing
    if (state.selectedTaskFullIds.size !== 1) {
        return true;
    }
    
    const [selectedTaskFullId] = state.selectedTaskFullIds;
    
    // Check if the global application API is available to handle the edit
    if (window.app && typeof window.app.editTask === 'function') {
        window.app.editTask(selectedTaskFullId);
    }
    
    return true;
}
