export function applyResizeRight(me, draggedTask, originalDuration, dragStartX, zoomLevel) {
    const deltaX = me.clientX - dragStartX;
    const dayDelta = Math.round(deltaX / (zoomLevel / 4)) * 0.25;
    draggedTask.duration = Math.max(0.25, originalDuration + dayDelta);
}
