import { state } from '../../core/state.js';

/**
 * Handles Ctrl+Enter to add a new task below the selection.
 * 
 * @param {Event} e - The keyboard event.
 * @returns {boolean} - Whether the event was handled.
 */
export function handleKeyboardCTRLEnter(e) {
    if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey)) return false;

    if (state.selectedTaskFullIds.size > 0) {
        e.preventDefault();
        if (window.app && typeof window.app.addBelow === 'function') {
            window.app.addBelow();
        }
        return true;
    }

    return false;
}
