

/**
 * Handles the start of a row drag operation.
 * 
 * @param {Event} e - The drag start event.
 */
export function handleGanttDragStart(e) {
    console.log(`[handleGanttDragStart] Event triggered`, { type: e.type, target: e.target });
    const row = e.target.closest('.gantt-row');
    if (row && row.dataset.id) {
        window.app.rowDragStart(e, row.dataset.id);
    }
}

/**
 * Handles the event when a dragged element is moved over a valid drop target.
 * 
 * @param {Event} e - The drag over event.
 */
export function handleGanttDragOver(e) {
    console.log(`[handleGanttDragOver] Event triggered`, { type: e.type, target: e.target });
    window.app.rowDragOver(e);
}

/**
 * Handles the event when a dragged element leaves a potential drop zone.
 * 
 * @param {Event} e - The drag leave event.
 */
export function handleGanttDragLeave(e) {
    console.log(`[handleGanttDragLeave] Event triggered`, { type: e.type, target: e.target });
    window.app.rowDragLeave(e);
}

/**
 * Handles the final drop action of a dragged row.
 * 
 * @param {Event} e - The drop event.
 */
export function handleGanttDrop(e) {
    console.log(`[handleGanttDrop] Event triggered`, { type: e.type, target: e.target });
    const row = e.target.closest('.gantt-row');
    if (row && row.dataset.id) {
        window.app.rowDrop(e, row.dataset.id);
    }
}
