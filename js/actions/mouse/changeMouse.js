/**
 * js/actions/mouse/changeMouse.js
 * Handles change events for mouse interactions, specifically for updating task properties.
 */

/**
 * Handles changes in Gantt chart input elements.
 * Orchestrates task property updates when an 'updateTask' action is triggered.
 * 
 * @param {Event} event - The DOM change event.
 */
export function changeMouse(event) {
    const targetElement = event.target;
    const actionElement = targetElement.dataset.action ? targetElement : targetElement.closest('[data-action]');

    if (actionElement && actionElement.dataset.action === 'updateTask') {
        const fullId = actionElement.dataset.id;
        const field = actionElement.dataset.field;
        const newValue = targetElement.value;
        window.app.updateTask(fullId, field, newValue);
    }
}
