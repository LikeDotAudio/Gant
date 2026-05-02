export function handleResizeLeft(me, barEl, originalLeft, originalWidth, dragStartX, zoomLevel) {
    const deltaX = me.clientX - dragStartX;
    const newWidth = Math.max(zoomLevel / 4, originalWidth - deltaX);
    const newLeft = originalLeft + (originalWidth - newWidth);
    barEl.style.width = `${newWidth}px`;
    barEl.style.left = `${newLeft}px`;
}
