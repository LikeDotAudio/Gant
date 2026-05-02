/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/progressbar functionality.
 */

export function applyResizeLeft(me, draggedTask, originalDuration, originalStart, dragStartX, zoomLevel) {
    const deltaX = me.clientX - dragStartX;
    const dayDelta = Math.round(deltaX / (zoomLevel / 4)) * 0.25;
    
    // Changing the start time should NOT change the duration.
    // originalDuration should remain the same.
    const newTime = originalStart.getTime() + (dayDelta * 86400000);
    const newDate = new Date(newTime);
    if (!isNaN(newDate.getTime())) {
        draggedTask.start = newDate.toISOString();
    }
    // Maintain the original duration
    draggedTask.duration = originalDuration;
}
