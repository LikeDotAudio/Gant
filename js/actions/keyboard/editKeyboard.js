import { state } from '../../core/state.js';

/**
 * Handles the Enter key to initiate task editing.
 * 
 * @param {Event} e - The keyboard event.
 * @returns {boolean} - Whether the event was handled.
 */
export function handleKeyboardEdit(e) {
    if (e.key !== 'Enter') return false;

    e.preventDefault();

    if (state.selectedTaskFullIds.size > 0) {
        const firstId = Array.from(state.selectedTaskFullIds)[0];
        if (window.app && typeof window.app.editTask === 'function') {
            window.app.editTask(firstId);
        }
        return true;
    }

    return false;
}
