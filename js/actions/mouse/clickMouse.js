/**
 * js/actions/mouse/clickMouse.js
 * Handles click events within the Gantt component and routes them to appropriate actions.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';

/**
 * Handles click events occurring within the Gantt component.
 * Routes UI actions to the application API.
 * 
 * @param {MouseEvent} event - The DOM click event.
 */
export function clickMouse(event) {
    console.log(`[clickMouse] Event triggered`, { type: event.type, target: event.target });
    const targetElement = event.target;
    const actionElement = targetElement.dataset.action ? targetElement : targetElement.closest('[data-action]');
    const action = actionElement?.dataset.action;
    const fullId = actionElement?.dataset.id || targetElement.closest('[data-id]')?.dataset.id;

    if (!action) {
        return;
    }

    switch (action) {
        case 'toggleFold':
            window.app.toggleFold(fullId, event);
            break;
        case 'selectTask':
            window.app.selectTask(fullId, event);
            break;
        case 'editTask':
        case 'editColor':
            window.app.editTask(fullId, event);
            break;
    }
}
