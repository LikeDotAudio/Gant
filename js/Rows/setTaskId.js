export function setTaskId(t, val, depth) {
    if (!t) return;
    if (depth === 0) t.RootID = val;
    else if (depth === 1) t.ParentID = val;
    else if (depth === 2) t.CHILDID = val;
    else if (depth === 3) t.siblingID = val;
    else t.id = val;
}
