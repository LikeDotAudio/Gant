import { state } from '../core/state.js';
import { render } from '../core/render.js';

/**
 * Event handler for mouse-down events on the Gantt chart.
 * Routes interactions to column resizing, bar dragging, or milestone dragging.
 * 
 * @param {Event} e - The DOM mouse-down event.
 */
export function handleGanttMouseDown(e) {
    const target = e.target;

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
