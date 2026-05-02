export function applyResizeLeft(me, draggedTask, originalDuration, originalStart, dragStartX, zoomLevel) {
    const deltaX = me.clientX - dragStartX;
    const dayDelta = Math.round(deltaX / (zoomLevel / 4)) * 0.25;
    const d = Math.max(0.25, originalDuration - dayDelta);
    const sDiff = originalDuration - d;
    const newTime = originalStart.getTime() + (sDiff * 86400000);
    draggedTask.start = new Date(newTime).toISOString();
    draggedTask.duration = d;
}
