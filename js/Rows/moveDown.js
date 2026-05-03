/**
 * js/Rows/moveDown.js
 * Logic for reordering a task downwards within its current hierarchical level.
 */

import { findParentAndIndex } from './search.js';

/**
 * Shifts a task one position lower within its parent's child collection.
 * 
 * @param {Array<Object>} projectRoots - The top-level project hierarchy.
 * @param {string} taskFullId - The dot-notated ID of the task to move.
 * @returns {boolean} - Returns true if the task was successfully shifted down.
 */
export function moveDown(projectRoots, taskFullId) {
    const { 
        parent: parentContainer, 
        index: currentTaskIndex 
    } = findParentAndIndex(projectRoots, taskFullId);
    
    // Check if the task exists and is not already at the bottom of its level
    if (parentContainer && currentTaskIndex < parentContainer.children.length - 1) {
        const [taskObject] = parentContainer.children.splice(currentTaskIndex, 1);
        
        // Re-insert at the following index
        parentContainer.children.splice(currentTaskIndex + 1, 0, taskObject);
        return true;
    }
    
    return false;
}
