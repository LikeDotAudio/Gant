/**
 * js/Rows/shiftItem.js
 * Handles hierarchical promotion (outdent) and demotion (indent) of tasks.
 */

import { findParentAndIndex, getFullIdOfParent, findTask, getChildren, setChildren } from './index.js';

/**
 * Changes the nesting level of a task by promoting it to a sibling of its parent, 
 * or demoting it to a child of its previous sibling.
 * 
 * @param {Array<Object>} projectRoots - The top-level project hierarchy.
 * @param {string} taskFullId - The dot-notated ID of the task to shift.
 * @param {string} shiftDirection - Interaction mode ('left' for outdent/promote, 'right' for indent/demote).
 * @returns {boolean} - Returns true if the hierarchy was modified.
 */
export function shiftItem(projectRoots, taskFullId, shiftDirection) {
    const { 
        parent: parentContainer, 
        index: currentTaskIndex 
    } = findParentAndIndex(projectRoots, taskFullId);
    
    if (!parentContainer || currentTaskIndex === -1) {
        return false;
    }

    if (shiftDirection === 'right' && currentTaskIndex > 0) {
        // DEMOTE: Move the task to be a child of the preceding sibling
        const previousSiblingTask = parentContainer.children[currentTaskIndex - 1];
        const [taskToDemote] = parentContainer.children.splice(currentTaskIndex, 1);
        
        let siblingChildrenCollection = getChildren(previousSiblingTask);
        if (!siblingChildrenCollection) {
            siblingChildrenCollection = [];
            setChildren(previousSiblingTask, siblingChildrenCollection);
        }
        
        previousSiblingTask.type = "summary";
        siblingChildrenCollection.push(taskToDemote);
        return true;
        
    } else if (shiftDirection === 'left') {
        // PROMOTE: Move the task to be a sibling of its current parent
        const parentTaskFullId = getFullIdOfParent(projectRoots, taskFullId);
        if (!parentTaskFullId) {
            return false; // Cannot outdent a root task
        }

        const { 
            parent: grandparentContainer, 
            index: parentTaskIndex 
        } = findParentAndIndex(projectRoots, parentTaskFullId);
        
        if (!grandparentContainer) {
            return false;
        }

        const [taskToPromote] = parentContainer.children.splice(currentTaskIndex, 1);
        
        // If the original parent is now empty, reset its type
        const originalParentObject = findTask(projectRoots, parentTaskFullId);
        if (originalParentObject && parentContainer.children.length === 0) {
            originalParentObject.type = "task";
        }

        // Insert directly after the original parent in the grandparent's list
        grandparentContainer.children.splice(parentTaskIndex + 1, 0, taskToPromote);
        return true;
    }
    
    return false;
}
