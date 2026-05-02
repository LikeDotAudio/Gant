import { state } from '../core/state.js';
import { render } from '../core/render.js';

export function handleGanttClick(e) {
    const target = e.target;
    const actionEl = target.dataset.action ? target : target.closest('[data-action]');
    const action = actionEl?.dataset.action;
    const id = actionEl?.dataset.id || target.closest('[data-id]')?.dataset.id;
    
    if (!action) return;

    switch (action) {
        case 'toggleFold':
            window.app.toggleFold(id, e);
            break;
        case 'selectTask':
            window.app.selectTask(id);
            break;
        case 'editTask':
        case 'editColor':
            window.app.editTask(id, e);
            break;
    }
}
