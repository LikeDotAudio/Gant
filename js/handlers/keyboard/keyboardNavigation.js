import { state } from '../../core/state.js';
import { render } from '../../core/render.js';

/**
 * Handles ArrowUp and ArrowDown for task selection navigation.
 * 
 * @param {Event} e - The keyboard event.
 * @returns {boolean} - Whether the event was handled.
 */
export function handleKeyboardNavigation(e) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return false;

    // Prevent browser vertical scrolling when navigating tasks
    e.preventDefault();

    const flat = state.flatTasks;
    if (!flat || flat.length === 0) return true;
    
    let newIdx = 0;
    if (state.selectedTaskFullIds.size > 0) {
        const lastSelectedId = Array.from(state.selectedTaskFullIds)[state.selectedTaskFullIds.size - 1];
        const currentIdx = flat.findIndex(t => t.fullId === lastSelectedId);
        if (e.key === 'ArrowUp') newIdx = (currentIdx - 1 + flat.length) % flat.length;
        else newIdx = (currentIdx + 1) % flat.length;
    }

    state.selectedTaskFullIds.clear();
    state.selectedTaskFullIds.add(flat[newIdx].fullId);
    
    render(false); 
    return true;
}
