/**
 * js/Rows/moveUp.js
 * Logic for reordering a task upwards within its current hierarchical level.
 */

import { log } from "./../utils/logger.js";
import { findParentAndIndex } from './search.js';

/**
 * Shifts a task one position higher within its parent's child collection.
 * 
 * @param {Array<Object>} projectRoots - The top-level project hierarchy.
 * @param {string} taskFullId - The dot-notated ID of the task to move.
 * @returns {boolean} - Returns true if the task was successfully shifted up.
 */
export function moveUp(projectRoots, taskFullId) { 
    log("moveUp", "Initiating upwards task shift", { taskFullId });
    
    const { 
        parent: parentContainer, 
        index: currentTaskIndex 
    } = findParentAndIndex(projectRoots, taskFullId);
    
    // Check if the task exists and is not already at the top of its level
    if (parentContainer && currentTaskIndex > 0) {
        const [taskObject] = parentContainer.children.splice(currentTaskIndex, 1);
        
        // Re-insert at the preceding index
        parentContainer.children.splice(currentTaskIndex - 1, 0, taskObject);
        return true;
    }
    
    return false;
}
