/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles WBS task operations such as adding, deleting, moving, and searching within the hierarchy.
 */

import * as gantt from './index.js';

export function deleteTask(roots, fullId) {
    if (!fullId) return { changed: false };
    const { parent, index } = gantt.findParentAndIndex(roots, fullId);
    if (!parent || index === -1) return { changed: false };

    const [deleted] = parent.children.splice(index, 1);
    
    // If parent is now empty, it might not be a summary anymore
    const parentFullId = gantt.getFullIdOfParent(roots, fullId);
    if (parentFullId) {
        const actualParent = gantt.findTask(roots, parentFullId);
        if (actualParent && parent.children.length === 0) {
            actualParent.type = "task";
        }
    }

    return { changed: true, name: deleted.name };
}
