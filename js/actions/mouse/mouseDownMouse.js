/**
 * js/actions/mouse/mouseDownMouse.js
 * Handles mouse-down events on the Gantt chart, routing them to specific interaction handlers.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';

/**
 * Event handler for mouse-down events on the Gantt chart.
 * Routes interactions to column resizing, bar dragging, or milestone dragging.
 * 
 * @param {MouseEvent} event - The DOM mouse-down event.
 */
export function mouseDownMouse(event) {
    const targetElement = event.target;

    if (targetElement.classList.contains('col-resizer')) {
        const columnId = targetElement.dataset.col;
        window.app.startColResize(event, columnId);
        return;
    }

    const actionElement = targetElement.dataset.action ? targetElement : targetElement.closest('[data-action]');
    const action = actionElement?.dataset.action;
    const fullId = actionElement?.dataset.id || targetElement.closest('[data-id]')?.dataset.id;

    if (action === 'barInteract' || action === 'resize-left' || action === 'resize-right') {
        const mode = action === 'barInteract' ? 'move' : action;
        if (fullId) {
            state.selectedTaskFullIds.clear();
            state.selectedTaskFullIds.add(fullId);
            render(false);
        }
        window.app.startBarDrag(event, fullId, mode);
    } else if (action === 'dependency-start') {
        window.app.startDependencyDrag(event, fullId);
    } else if (action === 'milestoneDrag') {
        const milestoneIndex = parseInt(actionElement.dataset.index);
        window.app.startMilestoneDrag(event, milestoneIndex);
    }
}
