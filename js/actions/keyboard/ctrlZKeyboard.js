/**
 * js/actions/keyboard/ctrlZKeyboard.js
 * Handles the keyboard shortcut for the undo operation.
 */

import { undoManager } from '../../Undo/manager.js';

/**
 * Monitors for Ctrl+Z (or Cmd+Z on macOS) to trigger an undo action.
 * 
 * @param {KeyboardEvent} keyboardEvent - The browser's native keyboard event.
 * @returns {boolean} - Returns true if the undo command was triggered and handled.
 */
export function ctrlZKeyboard(keyboardEvent) {
    const isZKey = keyboardEvent.key === 'z';
    const isControlOrMetaPressed = keyboardEvent.ctrlKey || keyboardEvent.metaKey;

    if (isZKey && isControlOrMetaPressed) {
        keyboardEvent.preventDefault();
        undoManager.undo();
        return true;
    }
    return false;
}
