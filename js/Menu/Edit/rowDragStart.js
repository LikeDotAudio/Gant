/**
 * js/Menu/Edit/rowDragStart.js
 * Handles the initiation of a row drag operation for reordering tasks.
 */

import { state } from '../../core/state.js';

/**
 * Initializes the dragging state when a task row starts being moved.
 * 
 * @param {DragEvent} dragEvent - The native HTML5 drag event.
 * @param {string} taskFullId - The dot-notated full ID of the task being dragged.
 */
export function rowDragStart(dragEvent, taskFullId) { 
    state.draggedRowFullId = taskFullId; 
    
    // Add visual feedback to the element being dragged
    const draggedElement = dragEvent.target;
    if (draggedElement && draggedElement.classList) {
        draggedElement.classList.add('dragging'); 
    }
}
