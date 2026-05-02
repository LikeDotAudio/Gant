import { state } from '../core/state.js';

/**
 * Initiates the editing mode for the currently selected task name.
 * F2 shortcut behavior.
 */
export function handleF2() {
    if (state.selectedTaskFullIds.size !== 1) return;
    
    const [fullId] = state.selectedTaskFullIds;
    if (window.app && typeof window.app.editTask === 'function') {
        window.app.editTask(fullId);
    }
}
