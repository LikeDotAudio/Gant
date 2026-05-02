import { findParentAndIndex } from './findParentAndIndex.js';
import { getFullIdOfParent } from './getFullIdOfParent.js';
import { findTask } from './findTask.js';
import { getChildren } from './getChildren.js';
import { setChildren } from './setChildren.js';

/**
 * Moves an item within the hierarchical task tree.
 * 
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
    const { parent: sourceParent, index: sourceIdx } = findParentAndIndex(roots, sourceId);
    if (!sourceParent || sourceIdx === -1) return false;
    
    const [taskToMove] = sourceParent.children.splice(sourceIdx, 1);
    
    // If the source parent is now empty, it's no longer a summary
    const sourceParentFullId = getFullIdOfParent(roots, sourceId);
    if (sourceParentFullId) {
        const actualSourceParent = findTask(roots, sourceParentFullId);
        if (actualSourceParent && sourceParent.children.length === 0) {
            actualSourceParent.type = "task";
        }
    }

    // 2. Find the target and insert
    if (position === 'into') {
        const targetTask = findTask(roots, targetId);
        if (!targetTask) return false;
        
        let targetChildren = getChildren(targetTask);
        if (!targetChildren) {
            targetChildren = [];
            setChildren(targetTask, targetChildren);
        }
        targetTask.type = "summary";
        targetChildren.push(taskToMove);
    } else {
        const { parent: targetParent, index: targetIdx } = findParentAndIndex(roots, targetId);
        if (!targetParent || targetIdx === -1) return false;
        
        const insertAt = position === 'before' ? targetIdx : targetIdx + 1;
        targetParent.children.splice(insertAt, 0, taskToMove);
    }
    
    return true;
}
