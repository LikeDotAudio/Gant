/**
 * js/actions/keyboard/editKeyboard.js
 * Handles the Enter keyboard shortcut to initiate editing of the selected task.
 */

import { state } from '../../core/state.js';

/**
 * Handles the Enter key to initiate task editing.
 * 
 * @param {KeyboardEvent} event - The native keyboard event.
 * @returns {boolean} - Returns true if the event was handled, false otherwise.
 */
export function editKeyboard(event) {
    if (event.key !== 'Enter') {
        return false;
    }

    event.preventDefault();

    if (state.selectedTaskFullIds.size > 0) {
        const firstSelectedFullId = Array.from(state.selectedTaskFullIds)[0];
        if (window.app && typeof window.app.editTask === 'function') {
            window.app.editTask(firstSelectedFullId);
        }
        return true;
    }

    return false;
}
