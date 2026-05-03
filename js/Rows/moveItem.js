/**
 * js/Rows/moveItem.js
 * Comprehensive logic for moving a task to a different position in the project hierarchy.
 * Supports nesting into a task, or placing before/after a target task.
 */

import { findParentAndIndex } from './search.js';
import { getFullIdOfParent, findTask, getChildren, setChildren } from './index.js';

/**
 * Moves a task from its current position to a new target location.
 * 
 * @param {Array<Object>} projectRoots - The top-level project hierarchy.
 * @param {string} sourceTaskFullId - The ID of the task to be moved.
 * @param {string} targetLocationFullId - The ID of the task that defines the destination.
 * @param {string} relativePosition - Interaction mode ('into', 'before', or 'after').
 * @returns {boolean} - Returns true if the task was successfully moved.
 */
export function moveItem(projectRoots, sourceTaskFullId, targetLocationFullId, relativePosition = 'into') {
    // Avoid moving a task to its own position
    if (sourceTaskFullId === targetLocationFullId) {
        return false;
    }
    
    // Prevent invalid recursive nesting (moving a parent into one of its own descendants)
    if (targetLocationFullId.startsWith(sourceTaskFullId + '.')) {
        return false;
    }

    // 1. Locate and remove the task from its original parent collection
    const { 
        parent: sourceParentContainer, 
        index: sourceTaskIndex 
    } = findParentAndIndex(projectRoots, sourceTaskFullId);
    
    if (!sourceParentContainer || sourceTaskIndex === -1) {
        return false;
    }
    
    const [taskBeingMoved] = sourceParentContainer.children.splice(sourceTaskIndex, 1);
    
    // If the original parent is now empty, reset its type to a standard task
    const sourceParentFullId = getFullIdOfParent(projectRoots, sourceTaskFullId);
    if (sourceParentFullId) {
        const sourceParentObject = findTask(projectRoots, sourceParentFullId);
        if (sourceParentObject && sourceParentContainer.children.length === 0) {
            sourceParentObject.type = "task";
        }
    }

    // 2. Identify the target location and insert the task
    if (relativePosition === 'into') {
        const targetTaskObject = findTask(projectRoots, targetLocationFullId);
        if (!targetTaskObject) {
            return false;
        }
        
        let targetChildrenCollection = getChildren(targetTaskObject);
        if (!targetChildrenCollection) {
            targetChildrenCollection = [];
            setChildren(targetTaskObject, targetChildrenCollection);
        }
        
        targetTaskObject.type = "summary";
        targetChildrenCollection.push(taskBeingMoved);
    } else {
        const { 
            parent: targetParentContainer, 
            index: targetTaskIndex 
        } = findParentAndIndex(projectRoots, targetLocationFullId);
        
        if (!targetParentContainer || targetTaskIndex === -1) {
            return false;
        }
        
        const insertionIndex = (relativePosition === 'before') ? targetTaskIndex : targetTaskIndex + 1;
        targetParentContainer.children.splice(insertionIndex, 0, taskBeingMoved);
    }
    
    return true;
}
