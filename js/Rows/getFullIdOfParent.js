/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles WBS task operations such as adding, deleting, moving, and searching within the hierarchy.
 */

export function getFullIdOfParent(tasks, fullId) {
    if (!fullId) return null;
    const parts = fullId.split('.');
    if (parts.length <= 1) return null;
    return parts.slice(0, -1).join('.');
}
