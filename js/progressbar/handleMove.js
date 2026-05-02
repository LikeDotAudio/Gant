/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/progressbar functionality.
 */

export function handleMove(me, barEl, originalLeft, dragStartX, dragStartY) {
    const deltaX = me.clientX - dragStartX;
    const deltaY = me.clientY - dragStartY;
    barEl.style.left = `${originalLeft + deltaX}px`;
    barEl.style.top = `${3 + deltaY}px`; // Visual ghosting vertically
    barEl.style.opacity = '0.7';
}
