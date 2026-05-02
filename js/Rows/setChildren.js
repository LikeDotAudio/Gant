export function setChildren(t, arr) {
    if (!t) return;
    if (t.roots) t.roots = arr;
    else if (t.parents) t.parents = arr;
    else if (t.children) t.children = arr;
    else if (t.siblings) t.siblings = arr;
    else t.children = arr; // Default
}
