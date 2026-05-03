/**
 * js/Menu/Edit/rowDragLeave.js
 * Handles the drag-leave event for gantt rows during drag-and-drop operations.
 */

/**
 * Removes the 'drag-over' visual indicator from a gantt row when a dragged item leaves it.
 * 
 * @param {DragEvent} event - The drag event.
 * @returns {void}
 */
export function rowDragLeave(event) { 
    const row = event.target.closest('.gantt-row'); 
    if (row) {
        row.classList.remove('drag-over'); 
    }
}
