/**
 * Event handler for double-click events in the Gantt chart.
 * Triggers interactions like milestone creation or task editing.
 * 
 * @param {Event} e - The DOM double-click event.
 */
export function handleMouseDblClick(e) {
    const target = e.target;
    const actionEl = target.dataset.action ? target : target.closest('[data-action]');
    const action = actionEl?.dataset.action;

    if (action === 'addMilestone') {
        window.app.addMilestone(e, actionEl.dataset.minDate);
        return;
    }

    const row = e.target.closest('.gantt-row');
    const bar = e.target.closest('.bar');
    const id = row?.dataset.id || bar?.dataset.id;

    if (id) {
        window.app.editTask(id, e);
    }
}
