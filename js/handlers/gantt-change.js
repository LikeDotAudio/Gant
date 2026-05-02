/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles change events within the Gantt chart, specifically triggering task updates.
 */

/**
 * Event handler for changes in the Gantt chart inputs.
 * When an input element with the 'updateTask' action is changed, this function 
 * orchestrates the update of the corresponding task property in the application state.
 * 
 * @param {Event} e - The DOM event triggered by the change.
 * @returns {void}
 */
export function handleGanttChange(e) {
    const target = e.target;
    // Identify the element that triggered the action, traversing up the DOM to find 
    // any ancestor with the 'data-action' attribute.
    const actionEl = target.dataset.action ? target : target.closest('[data-action]');
    
    // Only proceed if the action is explicitly identified as 'updateTask'.
    // This ensures that we only trigger updates for relevant UI elements, 
    // avoiding unnecessary calls for non-task inputs.
    if (actionEl && actionEl.dataset.action === 'updateTask') {
        // Delegate the actual state update to the application's global updateTask method,
        // passing the identifier, the specific field being updated, and the new value.
        window.app.updateTask(actionEl.dataset.id, actionEl.dataset.field, target.value);
    }
}
