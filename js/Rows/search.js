import { getChildren } from './getChildren.js';
import { getTaskId } from './id-manager.js';
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
export function findTask(tasks, fullId) { 
    const { parent, index } = findParentAndIndex(tasks, fullId); 
    return (parent && index !== -1) ? parent.children[index] : null; 
}
export function getFullIdOfParent(tasks, fullId) {
    if (!fullId) return null;
    const parts = fullId.split('.');
    if (parts.length <= 1) return null;
    return parts.slice(0, -1).join('.');
}
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
