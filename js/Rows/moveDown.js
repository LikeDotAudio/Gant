import { findParentAndIndex } from './findParentAndIndex.js';

/**
 * Moves a task down within its parent.
 * 
 * @param {Array} roots 
 * @param {string} fullId 
 * @returns {boolean}
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
