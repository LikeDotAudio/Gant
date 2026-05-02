/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Centralized event handler for click actions within the Gantt interface, dispatching events to appropriate application methods.
 */

import { state } from '../core/state.js';
import { render } from '../core/render.js';

/**
 * Handles click events occurring within the Gantt component.
 * It identifies the intended action from the clicked element's data attributes
 * and routes the execution to the corresponding application logic.
 * 
 * @param {Event} e - The DOM click event.
 * @returns {void}
 */
export function handleGanttClick(e) {
    const target = e.target;
    // Attempt to locate the nearest ancestor with a 'data-action' attribute.
    const actionEl = target.dataset.action ? target : target.closest('[data-action]');
    const action = actionEl?.dataset.action;
    // Resolve the associated task identifier, either from the action element or 
    // a parent element containing a 'data-id'.
    const id = actionEl?.dataset.id || target.closest('[data-id]')?.dataset.id;
    
    // Stop early if no valid action is found.
    if (!action) return;

    // Use a switch-case to dispatch based on the action type.
    // This provides a clear, maintainable way to extend the set of supported UI actions.
    switch (action) {
        case 'toggleFold':
            // Action to expand or collapse task groups.
            window.app.toggleFold(id, e);
            break;
        case 'selectTask':
            // Action to set the selected state for a specific task.
            window.app.selectTask(id);
            break;
        case 'editTask':
        case 'editColor':
            // Actions to initiate an edit mode for task metadata or visual properties.
            window.app.editTask(id, e);
            break;
    }
}
