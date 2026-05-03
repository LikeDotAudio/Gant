/**
 * js/Rows/findParentAndIndex.js
 * Utility to locate a task's parent container and its index within that container.
 */

import { getChildren } from './getChildren.js';
import { getTaskId } from './getTaskId.js';

/**
 * Recursively searches for the parent and index of a task given its full dot-notated ID.
 * 
 * @param {Array<Object>} taskList - The array of tasks to search within.
 * @param {string} targetFullId - The dot-notated full ID of the task to find.
 * @param {Object|null} currentParentTask - The parent task of the current taskList (internal use).
 * @returns {{parent: Object|null, index: number}} Object containing the parent and index. 
 *          If the task is a root, 'parent' contains a special wrapper around the root list.
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
            // Return a normalized parent object. 
            // If it's a root task, we wrap the root list so it behaves like a parent.children array.
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
