/**
 * js/Rows/getTaskId.js
 * Safely extracts the short (local) ID from a task object regardless of its level in the hierarchy.
 * Handles the "Case Insanity" of RootID, ParentID, CHILDID, siblingID and legacy 'id'.
 */

/**
 * Extracts the specific ID property from a task object and ensures it's a short ID.
 * 
 * @param {Object} task - The task object from the project hierarchy.
 * @returns {string} The string representation of the task's local ID.
 */
export function getTaskId(task) {
    if (!task) return "0";

    // Attempt to find the ID in various possible properties (PascalCase, SCREAMING, camel)
    const rawIdValue = (
        task.RootID || 
        task.ParentID || 
        task.CHILDID || 
        task.siblingID || 
        task.id || 
        "0"
    ).toString();

    // In case the ID is stored as a full dot-notated ID (e.g., "1.2.3"), 
    // we want just the leaf part ("3").
    if (rawIdValue.includes('.')) {
        const idParts = rawIdValue.split('.');
        return idParts[idParts.length - 1];
    }

    return rawIdValue;
}
