/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/progressbar functionality.
 */

export function handleResizeRight(me, barEl, originalWidth, dragStartX, zoomLevel) {
    const deltaX = me.clientX - dragStartX;
    const newWidth = Math.max(zoomLevel / 4, originalWidth + deltaX);
    barEl.style.width = `${newWidth}px`;
}
