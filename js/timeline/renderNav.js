import { getStickyWidthPx } from './getStickyWidthPx.js';
export function renderNav(canvas, viewport, container, chart, flatTasks, minStr, maxStr, zoomLevel) {
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    if (!flatTasks || flatTasks.length === 0 || !minStr || !maxStr) return;
    const minDate = new Date(minStr + 'T00:00:00');
    const maxDate = new Date(maxStr + 'T00:00:00');
    const fullW = chart.scrollWidth;
    const fullH = chart.scrollHeight;
    if (fullW === 0 || fullH === 0) return;
    const scaleX = cw / fullW;
    const scaleY = ch / fullH;
    const rowHeight = 24;
    const headerHeight = 108;
    const stickyWidthPx = getStickyWidthPx();
    // Draw all tasks from the data model
    flatTasks.forEach((t, i) => {
        const s = new Date(t.calculatedStart);
        const l = Math.floor((s - minDate) / 86400000) * zoomLevel;
        const w = Math.max((t.duration || 1) * zoomLevel, 5);
        const x = (stickyWidthPx + l) * scaleX;
        const y = (headerHeight + i * rowHeight) * scaleY;
        const barW = w * scaleX;
        const barH = 14 * scaleY; // Task bar height is 14px now
        ctx.fillStyle = t.resolvedColor || '#f4902c';
        ctx.globalAlpha = t.wbs_sibling === '-' ? 0.4 : 0.8; // Faint summary bars
        ctx.fillRect(x, y, Math.max(barW, 2), Math.max(barH, 2));
    });
    ctx.globalAlpha = 1.0;
    // Update viewport box
    const vW = container.clientWidth * scaleX;
    const vH = container.clientHeight * scaleY;
    const vL = container.scrollLeft * scaleX;
    const vT = container.scrollTop * scaleY;
    viewport.style.width = `${vW}px`;
    viewport.style.height = `${vH}px`;
    viewport.style.left = `${vL}px`;
    viewport.style.top = `${vT}px`;
}
