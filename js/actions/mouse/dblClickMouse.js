/**
 * js/actions/mouse/dblClickMouse.js
 * Handles double-click events in the Gantt chart, triggering milestone creation or task editing.
 */

/**
 * Event handler for double-click events in the Gantt chart.
 * Triggers interactions like milestone creation or task editing.
 * 
 * @param {MouseEvent} event - The DOM double-click event.
 */
export function dblClickMouse(event) {
    const targetElement = event.target;
    const actionElement = targetElement.dataset.action ? targetElement : targetElement.closest('[data-action]');
    const action = actionElement?.dataset.action;

    if (action === 'addMilestone') {
        const minDate = actionElement.dataset.minDate;
        window.app.addMilestone(event, minDate);
        return;
    }

    const rowElement = targetElement.closest('.gantt-row');
    const barElement = targetElement.closest('.bar');
    const elementWithId = targetElement.closest('[data-id]');
    const fullId = actionElement?.dataset.id || elementWithId?.dataset.id || rowElement?.dataset.id || barElement?.dataset.id;

    if (fullId) {
        window.app.editTask(fullId, event);
    }
}
