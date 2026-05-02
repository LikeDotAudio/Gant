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
