import { state } from '../core/state.js';
import { render } from '../core/render.js';

export function handleGanttMouseDown(e) {
    const target = e.target;
    
    // Check for column resizer first
    if (target.classList.contains('col-resizer')) {
        window.app.startColResize(e, target.dataset.col);
        return;
    }

    const actionEl = target.dataset.action ? target : target.closest('[data-action]');
    const action = actionEl?.dataset.action;
    const id = actionEl?.dataset.id || target.closest('[data-id]')?.dataset.id;

    if (action === 'barInteract' || action === 'resize-left' || action === 'resize-right') {
        const mode = action === 'barInteract' ? 'move' : action;
        if (id) {
            state.selectedTaskFullId = id;
            render();
        }
        window.app.startBarDrag(e, id, mode);
    } else if (action === 'milestoneDrag') {
        window.app.startMilestoneDrag(e, parseInt(actionEl.dataset.index));
    }
}
