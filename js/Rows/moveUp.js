import { log } from "./../utils/logger.js";
import { findParentAndIndex } from './findParentAndIndex.js';

/**
 * Moves a task up within its parent.
 * 
 * @param {Array} roots 
 * @param {string} fullId 
 * @returns {boolean}
 */
export function moveUp(roots, fullId) { log("moveUp", "Moving task up", { fullId });
    const { parent, index } = findParentAndIndex(roots, fullId);
    
    if (parent && index > 0) {
        const [task] = parent.children.splice(index, 1);
        parent.children.splice(index - 1, 0, task);
        return true;
    }
    
    return false;
}
