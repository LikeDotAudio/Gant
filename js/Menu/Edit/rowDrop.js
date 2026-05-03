import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { persistState } from '../../utils/persistence.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';

export function rowDrop(e, targetFullId) {
    e.preventDefault();
    const row = e.target.closest('.gantt-row'); 
    if (row) row.classList.remove('drag-over');
    if (!state.draggedRowFullId || state.draggedRowFullId === targetFullId) return;
    undoManager.pushState();
    const { parent: oldP, index: oldIdx } = gantt.findParentAndIndex(state.projectData.roots, state.draggedRowFullId);
    const [task] = oldP.children.splice(oldIdx, 1);
    const target = gantt.findTask(state.projectData.roots, targetFullId);
    let targetChildren = gantt.getChildren(target);
    if (!targetChildren) { 
        targetChildren = []; 
        gantt.setChildren(target, targetChildren); 
        target.type = "summary"; 
    }
    targetChildren.push(task);
    gantt.refreshIds(state.projectData.roots);
    state.selectedTaskFullId = gantt.findFullId(state.projectData.roots, task);
    render(true); 
    persistState();
}
