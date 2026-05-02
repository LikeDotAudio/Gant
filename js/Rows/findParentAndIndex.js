/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Handles WBS task operations such as adding, deleting, moving, and searching within the hierarchy.
 */

import { getChildren } from './getChildren.js';
import { getTaskId } from './getTaskId.js';

export function findParentAndIndex(tasks, fullId, parent = null) {
    if (!tasks) return { parent: null, index: -1 };
    for (let i = 0; i < tasks.length; i++) {
        const t = tasks[i];
        const tid = getTaskId(t);
        const currentFullId = parent ? `${parent.fullId}.${tid}` : tid;
        if (currentFullId === fullId) {
            return { parent: parent ? { ...parent, children: getChildren(parent) } : { children: tasks }, index: i };
        }
        const children = getChildren(t);
        if (children) {
            const res = findParentAndIndex(children, fullId, { ...t, fullId: currentFullId });
            if (res.parent) return res;
        }
    }
    return { parent: null, index: -1 };
}
