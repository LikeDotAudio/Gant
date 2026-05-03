/**
 * js/Menu/Edit/startBarDrag.js
 * Bridge function to initiate a timeline bar drag interaction.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as progressBarHandlers from '../../progressbar/index.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Captures the current state and delegates the drag operation to the progress bar module.
 * 
 * @param {MouseEvent} mouseEvent - The mouse down event that started the drag.
 * @param {string} taskFullId - The ID of the task being manipulated.
 * @param {string} dragMode - The type of drag (e.g., 'move', 'resize-left', 'resize-right').
 */
export function startBarDrag(mouseEvent, taskFullId, dragMode) { 
    undoManager.pushState();
    
    progressBarHandlers.startBarDrag(
        mouseEvent, 
        taskFullId, 
        dragMode, 
        state, 
        render
    ); 
}
