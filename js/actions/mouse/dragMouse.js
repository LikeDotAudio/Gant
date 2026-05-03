/**
 * js/actions/mouse/dragMouse.js
 * Handles drag and drop events for rows within the Gantt chart.
 */

/**
 * Handles the start of a row drag operation.
 * 
 * @param {DragEvent} event - The drag start event.
 */
export function dragStartMouse(event) {
    console.log(`[dragStartMouse] Event triggered`, { type: event.type, target: event.target });
    const rowElement = event.target.closest('.gantt-row');
    if (rowElement && rowElement.dataset.id) {
        const fullId = rowElement.dataset.id;
        window.app.rowDragStart(event, fullId);
    }
}

/**
 * Handles the event when a dragged element is moved over a valid drop target.
 * 
 * @param {DragEvent} event - The drag over event.
 */
export function dragOverMouse(event) {
    console.log(`[dragOverMouse] Event triggered`, { type: event.type, target: event.target });
    window.app.rowDragOver(event);
}

/**
 * Handles the event when a dragged element leaves a potential drop zone.
 * 
 * @param {DragEvent} event - The drag leave event.
 */
export function dragLeaveMouse(event) {
    console.log(`[dragLeaveMouse] Event triggered`, { type: event.type, target: event.target });
    window.app.rowDragLeave(event);
}

/**
 * Handles the final drop action of a dragged row.
 * 
 * @param {DragEvent} event - The drop event.
 */
export function dropMouse(event) {
    console.log(`[dropMouse] Event triggered`, { type: event.type, target: event.target });
    const rowElement = event.target.closest('.gantt-row');
    if (rowElement && rowElement.dataset.id) {
        const fullId = rowElement.dataset.id;
        window.app.rowDrop(event, fullId);
    }
}
