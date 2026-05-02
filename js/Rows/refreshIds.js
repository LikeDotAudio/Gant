import { setTaskId } from './setTaskId.js';
import { getChildren } from './getChildren.js';

export function refreshIds(tasks, depth = 0) { 
    tasks.forEach((t, i) => { 
        setTaskId(t, (i + 1).toString(), depth);
        const children = getChildren(t);
        if (children) refreshIds(children, depth + 1); 
    }); 
}
