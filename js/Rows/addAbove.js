import { findParentAndIndex } from './findParentAndIndex.js';
export function addAbove(roots, selectedId) {
    if (!selectedId) return { changed: false };
    const { parent, index } = findParentAndIndex(roots, selectedId);
    if (!parent || index === -1) return { changed: false };
    const newTask = { id: "", name: "New Task", duration: 4, progress: 0 };
    parent.children.splice(index, 0, newTask);
    return { changed: true, newTask };
}
