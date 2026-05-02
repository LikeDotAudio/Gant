import { findParentAndIndex } from './findParentAndIndex.js';
import { getFullIdOfParent } from './getFullIdOfParent.js';
import { findTask } from './findTask.js';
import { getChildren } from './getChildren.js';
import { setChildren } from './setChildren.js';

/**
 * Changes the indentation level of a task (Promote/Demote).
 * @param {Array} roots 
 * @param {string} fullId 
 * @param {string} direction - 'left' (promote) or 'right' (demote)
 */
export function shiftItem(roots, fullId, direction) {
    const { parent, index } = findParentAndIndex(roots, fullId);
    if (!parent || index === -1) return false;

    if (direction === 'right' && index > 0) {
        // Demote: Move into the previous sibling
        const prevSibling = parent.children[index - 1];
        const [task] = parent.children.splice(index, 1);
        
        let children = getChildren(prevSibling);
        if (!children) {
            children = [];
            setChildren(prevSibling, children);
        }
        prevSibling.type = "summary";
        children.push(task);
        return true;
    } else if (direction === 'left') {
        // Promote: Move to be a sibling of the current parent
        const parentFullId = getFullIdOfParent(roots, fullId);
        if (!parentFullId) return false;

        const { parent: grandparent, index: parentIdx } = findParentAndIndex(roots, parentFullId);
        if (!grandparent) return false;

        const [task] = parent.children.splice(index, 1);
        
        // Update old parent type if empty
        const oldParent = findTask(roots, parentFullId);
        if (oldParent && parent.children.length === 0) {
            oldParent.type = "task";
        }

        grandparent.children.splice(parentIdx + 1, 0, task);
        return true;
    }
    
    return false;
}
