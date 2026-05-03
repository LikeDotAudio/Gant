import { setTaskId } from './setTaskId.js';
import { getChildren } from './getChildren.js';

export function refreshIds(tasks, depth = 0, parentId = "") {
    tasks.forEach((t, i) => {
        const id = (i + 1).toString();
        setTaskId(t, id, depth);
        const fullId = parentId ? `${parentId}.${id}` : id;
        t.fullId = fullId;
        const children = getChildren(t);
        if (children) {
            refreshIds(children, depth + 1, fullId);
        }
    });
}
