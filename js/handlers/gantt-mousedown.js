/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles mouse-down events to initiate user interactions like column resizing, task bar dragging, and milestone manipulation.
 */

import { state } from '../core/state.js';
import { render } from '../core/render.js';

/**
 * Event handler for mouse-down events on the Gantt chart.
 * This function identifies the type of interaction requested based on the clicked element
 * and dispatches the relevant application start-methods.
 * 
 * @param {Event} e - The DOM mouse-down event.
 * @returns {void}
 */
export function handleGanttMouseDown(e) {
    const target = e.target;
    
    // 1. Handle column resizing: Check if the user initiated a column resize interaction.
    if (target.classList.contains('col-resizer')) {
        window.app.startColResize(e, target.dataset.col);
        return;
    }

    const actionEl = target.dataset.action ? target : target.closest('[data-action]');
    const action = actionEl?.dataset.action;
    const id = actionEl?.dataset.id || target.closest('[data-id]')?.dataset.id;

    // 2. Handle task bar interactions: Includes moving, or resizing from either side.
    if (action === 'barInteract' || action === 'resize-left' || action === 'resize-right') {
        const mode = action === 'barInteract' ? 'move' : action;
        
        // Ensure the task is marked as selected in the UI state before starting the interaction.
        if (id) {
            state.selectedTaskFullId = id;
            render();
        }
        window.app.startBarDrag(e, id, mode);
    } 
    // 3. Handle milestone dragging: Specific interaction for milestone points.
    else if (action === 'milestoneDrag') {
        window.app.startMilestoneDrag(e, parseInt(actionEl.dataset.index));
    }
}
