/**
 * js/Rows/deleteTask.js
 * Logic for removing tasks from the hierarchy and managing resulting parent state.
 */

import { findParentAndIndex, findTask, getFullIdOfParent } from './search.js';

/**
 * Removes a task from the project hierarchy.
 * If the parent becomes empty, it updates the parent's type to a standard task.
 * 
 * @param {Array<Object>} projectRoots - The top-level project hierarchy.
 * @param {string} taskFullId - The dot-notated ID of the task to delete.
 * @returns {{changed: boolean, name?: string}} Result indicating if deletion occurred and the name of the deleted task.
 */
export function deleteTask(projectRoots, taskFullId) {
    if (!taskFullId) {
        return { changed: false };
    }

    const { parent: parentTask, index: targetIndex } = findParentAndIndex(projectRoots, taskFullId);
    
    if (!parentTask || targetIndex === -1) {
        return { changed: false };
    }

    // Remove the task from the parent's children collection
    const [removedTaskObject] = parentTask.children.splice(targetIndex, 1);

    // After deletion, if the parent task has no children left, it should no longer be a summary/container
    const parentTaskFullId = getFullIdOfParent(projectRoots, taskFullId);
    
    if (parentTaskFullId) {
        const actualParentObject = findTask(projectRoots, parentTaskFullId);
        
        if (actualParentObject && parentTask.children.length === 0) {
            // Convert back to a leaf task if empty
            actualParentObject.type = "task";
        }
    }

    return { 
        changed: true, 
        name: removedTaskObject.name 
    };
}
