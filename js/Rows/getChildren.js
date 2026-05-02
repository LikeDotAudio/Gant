/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles WBS task operations such as adding, deleting, moving, and searching within the hierarchy.
 */

export function getChildren(t) {
    if (!t) return null;
    return t.roots || t.parents || t.children || t.siblings || null;
}
