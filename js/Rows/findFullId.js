/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles WBS task operations such as adding, deleting, moving, and searching within the hierarchy.
 */

import { getTaskId } from './getTaskId.js';
import { getChildren } from './getChildren.js';

export function findFullId(tasks, targetTask, parentId = "") {
    for (let t of tasks) {
        const tid = getTaskId(t);
        const fullId = parentId ? `${parentId}.${tid}` : tid;
        if (t === targetTask) return fullId;
        const children = getChildren(t);
        if (children) {
            const found = findFullId(children, targetTask, fullId);
            if (found) return found;
        }
    }
    return null;
}
