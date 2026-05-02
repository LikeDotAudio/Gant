import { getChildren } from './getChildren.js';
export function getTaskId(t) {
    if (!t) return "0";
    const id = (t.RootID || t.ParentID || t.CHILDID || t.siblingID || t.id || "0").toString();
    // If the ID contains dots (like "1.1"), take only the last part
    if (id.includes('.')) {
        const parts = id.split('.');
        return parts[parts.length - 1];
    }
    return id;
}
export function setTaskId(t, val, depth) {
    if (!t) return;
    if (depth === 0) t.RootID = val;
    else if (depth === 1) t.ParentID = val;
    else if (depth === 2) t.CHILDID = val;
    else if (depth === 3) t.siblingID = val;
    else t.id = val;
}
export function refreshIds(tasks, depth = 0) { 
    const usedIds = new Set();
    tasks.forEach((t) => {
        let baseId = getTaskId(t);
        
        // Ensure the ID is unique within this level
        let newId = baseId;
        let counter = 1;
        while (usedIds.has(newId)) {
            newId = `${baseId}_${counter}`;
            counter++;
        }
        
        setTaskId(t, newId, depth);
        usedIds.add(newId);
        
        const children = getChildren(t);
        if (children) refreshIds(children, depth + 1); 
    }); 
}
