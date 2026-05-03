/**
 * js/actions/keyboard/ctrlEnterKeyboard.js
 * Handles the Ctrl+Enter keyboard shortcut for adding a new task below the current selection.
 */

import { state } from '../../core/state.js';

/**
 * Handles Ctrl+Enter (or Cmd+Enter) to add a new task below the selection.
 * 
 * @param {KeyboardEvent} event - The native keyboard event.
 * @returns {boolean} - Returns true if the event was handled, false otherwise.
 */
export function ctrlEnterKeyboard(event) {
    if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey)) {
        return false;
    }

    if (state.selectedTaskFullIds.size > 0) {
        event.preventDefault();
        if (window.app && typeof window.app.addBelow === 'function') {
            window.app.addBelow();
        }
        return true;
    }

    return false;
}
