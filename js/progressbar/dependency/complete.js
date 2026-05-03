import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Completes the dependency connection if dropped on a valid target task.
 */
export function completeDependencyConnection(e, sourceId, svg) {
    const tempLine = svg.querySelector('#temp-dependency-line');
    if (tempLine) tempLine.remove();

    const targetBar = e.target.closest('.bar');
    if (!targetBar) return;

    const targetId = targetBar.dataset.id;
    if (!targetId || targetId === sourceId) return;

    const targetTask = gantt.findTask(state.projectData.roots, targetId);
    if (!targetTask) return;

    undoManager.pushState();
    
    // Set the dependency: The target task now depends on the source task
    targetTask.dependency = sourceId;
    
    state.dependencyDragSource = null;
    render(true);

    // Notify app to persist state
    if (window.app && typeof window.app.updateTask === 'function') {
        window.app.updateTask(targetId, 'dependency', sourceId); 
    }
}
