/**
 * Handles changes in Gantt chart input elements.
 * Orchestrates task property updates when an 'updateTask' action is triggered.
 * 
 * @param {Event} e - The DOM change event.
 */
export function handleMouseChange(e) {
    const target = e.target;
    const actionEl = target.dataset.action ? target : target.closest('[data-action]');

    if (actionEl && actionEl.dataset.action === 'updateTask') {
        window.app.updateTask(actionEl.dataset.id, actionEl.dataset.field, target.value);
    }
}
