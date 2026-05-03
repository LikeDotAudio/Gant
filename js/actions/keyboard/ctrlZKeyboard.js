import { undoManager } from '../../Undo/manager.js';

/**
 * Handles Ctrl+Z to perform an undo action.
 * 
 * @param {Event} e - The keyboard event.
 * @returns {boolean} - Whether the event was handled.
 */
export function handleKeyboardCTRLZ(e) {
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undoManager.undo();
        return true;
    }
    return false;
}
