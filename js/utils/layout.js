import { state } from '../core/state.js';
export function getStickyWidthPx() {
    const root = document.documentElement;
    // Define the list of column names used in the Gantt chart layout
    const cols = ['root', 'parent', 'child', 'sibling', 'color', 'dep', 'name', 'prog', 'start', 'end', 'dur'];
    let total = 0;
    cols.forEach(c => {
        const val = getComputedStyle(root).getPropertyValue(`--${c}-w`);
        total += parseFloat(val) || 0;
    });
    return total;
}
export function autoZoom() {
    const container = document.getElementById('gantt-container');
    if (!container) return;
    const viewportWidth = container.clientWidth;
    const stickyWidthPx = getStickyWidthPx(); 
    // Calculate the available width for the timeline after accounting for sticky columns
    const timelineWidth = viewportWidth - stickyWidthPx;
    if (timelineWidth > 200) {
        let targetZoom = Math.floor(timelineWidth / 28);
        state.zoomLevel = Math.max(20, Math.min(100, targetZoom));
    }
}
export function calculateTaskNameWidth(flatTasks) {
    if (!flatTasks || flatTasks.length === 0) return 280;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = "12.8px 'Segoe UI', sans-serif";
    let maxWidth = 100;
    flatTasks.forEach(t => {
        const indent = (t.depth || 0) * 10;
        const triangleWidth = 14; 
        const textWidth = ctx.measureText(t.name || '').width;
        const total = indent + triangleWidth + textWidth + 20;
        if (total > maxWidth) maxWidth = total;
    });
    const headerWidth = ctx.measureText("Task Name").width + 30;
    return Math.ceil(Math.max(maxWidth, headerWidth, 280));
}
