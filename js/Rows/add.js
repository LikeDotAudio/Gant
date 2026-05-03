/**
 * js/Rows/add.js
 * Logic for inserting new tasks into the hierarchical project tree.
 */

import { findParentAndIndex } from './search.js';

/**
 * Creates and inserts a new task directly above the specified task.
 * 
 * @param {Array<Object>} projectRoots - The top-level project hierarchy.
 * @param {string} selectedTaskFullId - The ID of the task that will be below the new one.
 * @returns {{changed: boolean, newTask?: Object}} Result indicating success and the new task object.
 */
export function addAbove(projectRoots, selectedTaskFullId) {
    console.log(`[Rows/add] Inserting new task above: ${selectedTaskFullId}`);
    
    if (!selectedTaskFullId) {
        return { changed: false };
    }

    const { parent: parentTask, index: targetIndex } = findParentAndIndex(projectRoots, selectedTaskFullId);
    
    if (!parentTask || targetIndex === -1) {
        return { changed: false };
    }

    const newTaskObject = { 
        name: "New Task", 
        duration: 4, 
        progress: 0 
    };

    // Insert at the same index, shifting the current task down
    parentTask.children.splice(targetIndex, 0, newTaskObject);
    
    return { changed: true, newTask: newTaskObject };
}

/**
 * Creates and inserts a new task directly below the specified task.
 * 
 * @param {Array<Object>} projectRoots - The top-level project hierarchy.
 * @param {string} selectedTaskFullId - The ID of the task that will be above the new one.
 * @returns {{changed: boolean, newTask?: Object}} Result indicating success and the new task object.
 */
export function addBelow(projectRoots, selectedTaskFullId) {
    console.log(`[Rows/add] Inserting new task below: ${selectedTaskFullId}`);
    
    if (!selectedTaskFullId) {
        return { changed: false };
    }

    const { parent: parentTask, index: targetIndex } = findParentAndIndex(projectRoots, selectedTaskFullId);
    
    if (!parentTask || targetIndex === -1) {
        return { changed: false };
    }

    const newTaskObject = { 
        name: "New Task", 
        duration: 4, 
        progress: 0 
    };

    // Insert at the next index
    parentTask.children.splice(targetIndex + 1, 0, newTaskObject);
    
    return { changed: true, newTask: newTaskObject };
}
