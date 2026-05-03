import { state } from '../../core/state.js';

/**
 * Initiates the editing mode for the currently selected task name.
 * F2 shortcut behavior.
 * 
 * @param {Event} e - The keyboard event.
 * @returns {boolean} - Whether the event was handled.
 */
export function handleKeyboardF2(e) {
    if (e.key !== 'F2') return false;

    e.preventDefault();

    if (state.selectedTaskFullIds.size !== 1) return true;
    
    const [fullId] = state.selectedTaskFullIds;
    if (window.app && typeof window.app.editTask === 'function') {
        window.app.editTask(fullId);
    }
    return true;
}
