export function getChildren(t) {
    if (!t) return null;
    return t.roots || t.parents || t.children || t.siblings || null;
}
