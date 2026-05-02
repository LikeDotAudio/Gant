export function getFullIdOfParent(tasks, fullId) {
    if (!fullId) return null;
    const parts = fullId.split('.');
    if (parts.length <= 1) return null;
    return parts.slice(0, -1).join('.');
}
