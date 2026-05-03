/**
 * js/Rows/search.js
 * Contains utility functions for searching and navigating the hierarchical project tree.
 */

import { getChildren } from './getChildren.js';
import { getTaskId } from './getTaskId.js';

/**
 * Recursively searches for the parent container and index of a task given its full dot-notated ID.
 * 
 * @param {Array<Object>} taskList - The list of tasks to search within.
 * @param {string} targetFullId - The dot-notated full ID of the task to locate.
 * @param {Object|null} currentParentTask - The parent task of the current taskList (internal use).
 * @returns {{parent: Object|null, index: number}} The parent object and the task's index within its child list.
 */
export function findParentAndIndex(taskList, targetFullId, currentParentTask = null) {
    if (!taskList) {
        return { parent: null, index: -1 };
    }

    for (let currentIndex = 0; currentIndex < taskList.length; currentIndex++) {
        const currentTask = taskList[currentIndex];
        const currentShortId = getTaskId(currentTask);
        const currentFullId = currentParentTask ? `${currentParentTask.fullId}.${currentShortId}` : currentShortId;

        if (currentFullId === targetFullId) {
            // Return a normalized parent structure. 
            // If it's a root task, wrap the root list to behave like a standard children array.
            const normalizedParent = currentParentTask 
                ? { ...currentParentTask, children: getChildren(currentParentTask) } 
                : { children: taskList };

            return { parent: normalizedParent, index: currentIndex };
        }

        const taskChildren = getChildren(currentTask);
        if (taskChildren) {
            const recursiveResult = findParentAndIndex(
                taskChildren, 
                targetFullId, 
                { ...currentTask, fullId: currentFullId }
            );
            
            if (recursiveResult.parent) {
                return recursiveResult;
            }
        }
    }

    return { parent: null, index: -1 };
}

/**
 * Locates a specific task object within the project hierarchy using its full ID.
 * 
 * @param {Array<Object>} projectRoots - The top-level list of project tasks.
 * @param {string} taskFullId - The dot-notated full ID of the target task.
 * @returns {Object|null} The task object if found, otherwise null.
 */
export function findTask(projectRoots, taskFullId) { 
    const { parent, index } = findParentAndIndex(projectRoots, taskFullId); 
    
    if (parent && index !== -1) {
        return parent.children[index];
    }
    
    return null;
}

/**
 * Calculates the full dot-notated ID of a task's parent based on the task's own full ID.
 * 
 * @param {Array<Object>} projectRoots - The project hierarchy (not currently used by this logic but kept for API consistency).
 * @param {string} taskFullId - The dot-notated ID of the child task.
 * @returns {string|null} The parent's full ID, or null if the task is a root.
 */
export function getFullIdOfParent(projectRoots, taskFullId) {
    if (!taskFullId) {
        return null;
    }

    const idSegments = taskFullId.split('.');
    if (idSegments.length <= 1) {
        return null; // This is a root task
    }

    // Join all segments except the last one to get the parent ID
    return idSegments.slice(0, -1).join('.');
}

/**
 * Recursively finds the dot-notated full ID for a specific task object.
 * 
 * @param {Array<Object>} taskList - The list of tasks to search within.
 * @param {Object} targetTaskObject - The literal task object to find.
 * @param {string} parentFullId - The full ID of the parent list being searched.
 * @returns {string|null} The full dot-notated ID of the task if found.
 */
export function findFullId(taskList, targetTaskObject, parentFullId = "") {
    for (const currentTask of taskList) {
        const localTaskId = getTaskId(currentTask);
        const currentFullId = parentFullId ? `${parentFullId}.${localTaskId}` : localTaskId;

        if (currentTask === targetTaskObject) {
            return currentFullId;
        }

        const taskChildren = getChildren(currentTask);
        if (taskChildren) {
            const resultFullId = findFullId(taskChildren, targetTaskObject, currentFullId);
            if (resultFullId) {
                return resultFullId;
            }
        }
    }

    return null;
}
