/**
 * js/Menu/Edit/rowDragOver.js
 * Handles the visual feedback when a task row is being dragged over another row.
 */

/**
 * Triggered when a draggable element is hovered over a task row.
 * Adds a visual highlight to the potential drop target.
 * 
 * @param {DragEvent} dragEvent - The native HTML5 drag event.
 */
export function rowDragOver(dragEvent) { 
    dragEvent.preventDefault(); 
    const hoveredRowElement = dragEvent.target.closest('.gantt-row'); 
    
    if (hoveredRowElement) {
        hoveredRowElement.classList.add('drag-over'); 
    }
}
