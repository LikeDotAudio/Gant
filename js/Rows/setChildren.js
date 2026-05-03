/**
 * js/Rows/setChildren.js
 * Safely updates or initializes the child task collection on a task object.
 */

/**
 * Assigns a new array of children to a task.
 * Preserves the existing schema's property naming if possible.
 * 
 * @param {Object} taskObject - The task to update.
 * @param {Array<Object>} childrenArray - The new collection of child tasks.
 */
export function setChildren(taskObject, childrenArray) {
    if (!taskObject) {
        return;
    }

    if (taskObject.roots) {
        taskObject.roots = childrenArray;
    } else if (taskObject.parents) {
        taskObject.parents = childrenArray;
    } else if (taskObject.children) {
        taskObject.children = childrenArray;
    } else if (taskObject.siblings) {
        taskObject.siblings = childrenArray;
    } else {
        // Default to 'children' if no existing property is detected
        taskObject.children = childrenArray;
    }
}
