/**
 * js/Rows/managerId.js
 * Manages the assignment and refreshing of task IDs across the hierarchy.
 */

import { getChildren } from './getChildren.js';
import { getTaskId } from './getTaskId.js';
import { DEPTH } from '../core/constants.js';

/**
 * Assigns an ID to a task object based on its depth in the hierarchy.
 * 
 * @param {Object} task - The task object to update.
 * @param {string} idValue - The new ID value to assign.
 * @param {number} hierarchyDepth - The current depth (0=Root, 1=Parent, etc.)
 */
export function setTaskId(task, idValue, hierarchyDepth) {
    if (!task) return;

    if (hierarchyDepth === DEPTH.ROOT) {
        task.RootID = idValue;
    } else if (hierarchyDepth === DEPTH.PARENT) {
        task.ParentID = idValue;
    } else if (hierarchyDepth === DEPTH.CHILD) {
        task.CHILDID = idValue;
    } else if (hierarchyDepth === DEPTH.SIBLING) {
        task.siblingID = idValue;
    } else {
        task.id = idValue;
    }
}

/**
 * Recursively refreshes IDs for a list of tasks to ensure uniqueness within each level.
 * 
 * @param {Array<Object>} taskList - The array of tasks to process.
 * @param {number} currentDepth - The current depth in the hierarchy.
 */
export function refreshIds(taskList, currentDepth = 0) { 
    const assignedIdsInCurrentLevel = new Set();

    taskList.forEach((task) => {
        let baseLocalId = getTaskId(task);
        
        // Handle collision within the same level
        let uniqueLocalId = baseLocalId;
        let collisionCounter = 1;
        while (assignedIdsInCurrentLevel.has(uniqueLocalId)) {
            uniqueLocalId = `${baseLocalId}_${collisionCounter}`;
            collisionCounter++;
        }
        
        setTaskId(task, uniqueLocalId, currentDepth);
        assignedIdsInCurrentLevel.add(uniqueLocalId);
        
        const children = getChildren(task);
        if (children) {
            refreshIds(children, currentDepth + 1); 
        }
    }); 
}
