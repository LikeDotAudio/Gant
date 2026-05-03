/**
 * js/Menu/View/toggleFold.js
 * Handles the manual folding/unfolding of individual task rows.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as columnOperations from '../../columns/index.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Toggles the folded state of a single task.
 * 
 * @param {string} taskFullId - The dot-notated full ID of the task to toggle.
 * @param {Event|null} interactionEvent - The mouse/keyboard event that triggered the toggle.
 */
export function toggleFold(taskFullId, interactionEvent) { 
    if (interactionEvent) {
        interactionEvent.stopPropagation(); 
    }

    undoManager.pushState();
    
    columnOperations.fold.toggleItem(state.foldedIds, taskFullId); 
    
    render(); 
}
