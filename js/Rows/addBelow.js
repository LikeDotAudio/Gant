/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles WBS task operations such as adding, deleting, moving, and searching within the hierarchy.
 */

import { findParentAndIndex } from './findParentAndIndex.js';

export function addBelow(roots, selectedId) {
    if (!selectedId) return { changed: false };
    const { parent, index } = findParentAndIndex(roots, selectedId);
    if (!parent || index === -1) return { changed: false };

    const newTask = { id: "", name: "New Task", duration: 4, progress: 0 };
    parent.children.splice(index + 1, 0, newTask);
    return { changed: true, newTask };
}
