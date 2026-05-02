/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles WBS task operations such as adding, deleting, moving, and searching within the hierarchy.
 */

import { findParentAndIndex } from './findParentAndIndex.js';

export function findTask(tasks, fullId) { 
    const { parent, index } = findParentAndIndex(tasks, fullId); 
    return (parent && index !== -1) ? parent.children[index] : null; 
}
