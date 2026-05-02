export function handleGanttChange(e) {
    const target = e.target;
    const actionEl = target.dataset.action ? target : target.closest('[data-action]');
    if (actionEl && actionEl.dataset.action === 'updateTask') {
        window.app.updateTask(actionEl.dataset.id, actionEl.dataset.field, target.value);
    }
}
