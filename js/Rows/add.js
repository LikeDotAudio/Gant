import * as gantt from './index.js';

export function addAbove(roots, selectedId) {
    console.log(`[addAbove] Adding a new task above the selected one`, { selectedId });
    if (!selectedId) return { changed: false };
    const { parent, index } = gantt.findParentAndIndex(roots, selectedId);
    if (!parent || index === -1) return { changed: false };
    const newTask = { name: "New Task", duration: 4, progress: 0 };
    parent.children.splice(index, 0, newTask);
    return { changed: true, newTask };
}
export function addBelow(roots, selectedId) {
    console.log(`[addBelow] Adding a new task below the selected one`, { selectedId });
    if (!selectedId) return { changed: false };
    const { parent, index } = gantt.findParentAndIndex(roots, selectedId);
    if (!parent || index === -1) return { changed: false };
    const newTask = { name: "New Task", duration: 4, progress: 0 };
    parent.children.splice(index + 1, 0, newTask);
    return { changed: true, newTask };
}
