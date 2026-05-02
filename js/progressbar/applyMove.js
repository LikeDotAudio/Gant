import { moveTaskVertically } from './moveTaskVertically.js';

export function applyMove(me, draggedTask, originalStart, dragStartX, dragStartY, zoomLevel, rowHeight, projectData, fullId, flat) {
    const deltaX = me.clientX - dragStartX;
    const deltaY = me.clientY - dragStartY;
    const dayDelta = Math.round(deltaX / (zoomLevel / 4)) * 0.25;

    const newTime = originalStart.getTime() + (dayDelta * 86400000);
    draggedTask.start = new Date(newTime).toISOString();

    // Vertical movement (reordering)
    const rowDelta = Math.round(deltaY / rowHeight);
    if (Math.abs(rowDelta) >= 1) {
        const currentIndex = flat.findIndex(t => t.fullId === fullId);
        const targetIndex = Math.max(0, Math.min(flat.length - 1, currentIndex + rowDelta));
        if (currentIndex !== targetIndex) {
            const targetTaskFullId = flat[targetIndex].fullId;
            moveTaskVertically(projectData, fullId, targetTaskFullId, rowDelta);
        }
    }
}
