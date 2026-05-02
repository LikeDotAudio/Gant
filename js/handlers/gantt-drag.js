/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Manages drag-and-drop interactions for tasks (rows) within the Gantt view.
 */

/**
 * Handles the start of a row drag operation.
 * 
 * @param {Event} e - The drag start event.
 * @returns {void}
 */
export function handleGanttDragStart(e) {
    const row = e.target.closest('.gantt-row');
    // Ensure the drag is initialized only if a valid task row is identified.
    if (row && row.dataset.id) {
        window.app.rowDragStart(e, row.dataset.id);
    }
}

/**
 * Handles the event when a dragged element is moved over a valid drop target.
 * 
 * @param {Event} e - The drag over event.
 * @returns {void}
 */
export function handleGanttDragOver(e) {
    // Delegates to the application's drag-over logic, typically used for highlighting potential drop zones.
    window.app.rowDragOver(e);
}

/**
 * Handles the event when a dragged element leaves a potential drop zone.
 * 
 * @param {Event} e - The drag leave event.
 * @returns {void}
 */
export function handleGanttDragLeave(e) {
    // Delegates to the application's drag-leave logic, clearing highlights or temporary states.
    window.app.rowDragLeave(e);
}

/**
 * Handles the final drop action of a dragged row.
 * 
 * @param {Event} e - The drop event.
 * @returns {void}
 */
export function handleGanttDrop(e) {
    const row = e.target.closest('.gantt-row');
    // Finalizes the operation by triggering the row drop method in the app, 
    // passing the event and the ID of the target row.
    if (row && row.dataset.id) {
        window.app.rowDrop(e, row.dataset.id);
    }
}
