/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles WBS task operations such as adding, deleting, moving, and searching within the hierarchy.
 */

import * as gantt from './index.js';

/**
 * Moves an item within the hierarchical task tree.
 * @param {Array} roots - The root tasks array.
 * @param {string} sourceId - The full ID of the task to move.
 * @param {string} targetId - The full ID of the target location.
 * @param {string} position - 'into', 'before', or 'after'.
 * @returns {boolean} - True if moved successfully.
 */
export function moveItem(roots, sourceId, targetId, position = 'into') {
    if (sourceId === targetId) return false;
    
    // Prevent moving a parent into its own child
    if (targetId.startsWith(sourceId + '.')) return false;

    // 1. Find the source and remove it
    const { parent: sourceParent, index: sourceIdx } = gantt.findParentAndIndex(roots, sourceId);
    if (!sourceParent || sourceIdx === -1) return false;
    
    const [taskToMove] = sourceParent.children.splice(sourceIdx, 1);
    
    // If the source parent is now empty, it's no longer a summary
    // Since findParentAndIndex returns a copy for the parent object but reference for children array,
    // we find the actual parent object to update its type.
    const sourceParentFullId = gantt.getFullIdOfParent(roots, sourceId);
    if (sourceParentFullId) {
        const actualSourceParent = gantt.findTask(roots, sourceParentFullId);
        if (actualSourceParent && sourceParent.children.length === 0) {
            actualSourceParent.type = "task";
        }
    }

    // 2. Find the target and insert
    if (position === 'into') {
        const targetTask = gantt.findTask(roots, targetId);
        if (!targetTask) return false;
        
        let targetChildren = gantt.getChildren(targetTask);
        if (!targetChildren) {
            targetChildren = [];
            gantt.setChildren(targetTask, targetChildren);
        }
        targetTask.type = "summary";
        targetChildren.push(taskToMove);
    } else {
        const { parent: targetParent, index: targetIdx } = gantt.findParentAndIndex(roots, targetId);
        if (!targetParent || targetIdx === -1) return false;
        
        const insertAt = position === 'before' ? targetIdx : targetIdx + 1;
        targetParent.children.splice(insertAt, 0, taskToMove);
    }
    
    return true;
}

/**
 * Changes the indentation level of a task (Promote/Demote).
 * @param {Array} roots 
 * @param {string} fullId 
 * @param {string} direction - 'left' (promote) or 'right' (demote)
 */
export function shiftItem(roots, fullId, direction) {
    const { parent, index } = gantt.findParentAndIndex(roots, fullId);
    if (!parent || index === -1) return false;

    if (direction === 'right' && index > 0) {
        // Demote: Move into the previous sibling
        const prevSibling = parent.children[index - 1];
        const [task] = parent.children.splice(index, 1);
        
        let children = gantt.getChildren(prevSibling);
        if (!children) {
            children = [];
            gantt.setChildren(prevSibling, children);
        }
        prevSibling.type = "summary";
        children.push(task);
        return true;
    } else if (direction === 'left') {
        // Promote: Move to be a sibling of the current parent
        const parentFullId = gantt.getFullIdOfParent(roots, fullId);
        if (!parentFullId) return false;

        const { parent: grandparent, index: parentIdx } = gantt.findParentAndIndex(roots, parentFullId);
        if (!grandparent) return false;

        const [task] = parent.children.splice(index, 1);
        
        // Update old parent type if empty
        const oldParent = gantt.findTask(roots, parentFullId);
        if (oldParent && parent.children.length === 0) {
            oldParent.type = "task";
        }

        grandparent.children.splice(parentIdx + 1, 0, task);
        return true;
    }
    
    return false;
}

/**
 * Moves a task up within its parent.
 */
export function moveUp(roots, fullId) {
    const { parent, index } = gantt.findParentAndIndex(roots, fullId);
    if (parent && index > 0) {
        const [task] = parent.children.splice(index, 1);
        parent.children.splice(index - 1, 0, task);
        return true;
    }
    return false;
}

/**
 * Moves a task down within its parent.
 */
export function moveDown(roots, fullId) {
    const { parent, index } = gantt.findParentAndIndex(roots, fullId);
    if (parent && index < parent.children.length - 1) {
        const [task] = parent.children.splice(index, 1);
        parent.children.splice(index + 1, 0, task);
        return true;
    }
    return false;
}
