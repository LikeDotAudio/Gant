/**
 * js/Menu/Edit/rowDrop.js
 * Handles the drop logic for reordering task rows or nesting them.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { persistState } from '../../utils/persistence.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Processes the completion of a drag-and-drop operation for a task row.
 * Currently implements nesting the dragged task into the target task.
 * 
 * @param {DragEvent} dragEvent - The native HTML5 drag event.
 * @param {string} targetTaskFullId - The full ID of the task where the item was dropped.
 */
export function rowDrop(dragEvent, targetTaskFullId) {
    dragEvent.preventDefault();
    
    // Clean up visual highlight on the drop target
    const targetRowElement = dragEvent.target.closest('.gantt-row'); 
    if (targetRowElement) {
        targetRowElement.classList.remove('drag-over');
    }

    const draggedTaskFullId = state.draggedRowFullId;

    // Safety check: Ensure we are dragging a valid row and not dropping onto itself
    if (!draggedTaskFullId || draggedTaskFullId === targetTaskFullId) {
        return;
    }

    undoManager.pushState();

    // 1. Locate and remove the task from its old parent
    const { parent: oldParent, index: oldIndex } = gantt.findParentAndIndex(state.projectData.roots, draggedTaskFullId);
    if (!oldParent || oldIndex === -1) {
        return;
    }
    
    const [movedTask] = oldParent.children.splice(oldIndex, 1);

    // 2. Locate the target task and its children collection
    const targetTask = gantt.findTask(state.projectData.roots, targetTaskFullId);
    if (!targetTask) {
        return;
    }

    let targetChildrenCollection = gantt.getChildren(targetTask);
    if (!targetChildrenCollection) { 
        targetChildrenCollection = []; 
        gantt.setChildren(targetTask, targetChildrenCollection); 
        targetTask.type = "summary"; 
    }

    // 3. Append the moved task to the new parent
    targetChildrenCollection.push(movedTask);

    // 4. Refresh IDs to maintain dot-notation hierarchy
    gantt.refreshIds(state.projectData.roots);
    
    // 5. Update selection to the moved task's new location
    const newFullId = gantt.findFullId(state.projectData.roots, movedTask);
    state.selectedTaskFullIds.clear();
    state.selectedTaskFullIds.add(newFullId);

    render(true); 
    persistState();
}
