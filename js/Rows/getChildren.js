/**
 * js/Rows/getChildren.js
 * Safely retrieves the child task collection from a task object, 
 * regardless of the specific property name used in the schema.
 */

import { log } from "./../utils/logger.js";

/**
 * Extracts the children array from a task.
 * Handles inconsistent property naming (roots, parents, children, siblings).
 * 
 * @param {Object|null} taskObject - The task to inspect.
 * @returns {Array<Object>|null} The collection of child tasks, or null if none exist.
 */
export function getChildren(taskObject) { 
    log("getChildren", "Retrieving children collection", { task: taskObject });
    
    if (!taskObject) {
        return null;
    }
    
    // Attempt to return the first non-null children-like property found
    return (
        taskObject.roots || 
        taskObject.parents || 
        taskObject.children || 
        taskObject.siblings || 
        null
    );
}
