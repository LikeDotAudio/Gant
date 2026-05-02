/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles WBS task operations such as adding, deleting, moving, and searching within the hierarchy.
 */

import { findParentAndIndex } from './findParentAndIndex.js';

/**
 * Moves a task down within its parent.
 */
export function moveDown(roots, fullId) {
    const { parent, index } = findParentAndIndex(roots, fullId);
    if (parent && index < parent.children.length - 1) {
        const [task] = parent.children.splice(index, 1);
        parent.children.splice(index + 1, 0, task);
        return true;
    }
    return false;
}
