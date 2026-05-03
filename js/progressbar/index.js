import * as gantt from '../Rows/index.js';
import { handleResizeRight } from './handleResizeRight.js';
import { handleResizeLeft } from './handleResizeLeft.js';
import { applyResizeRight } from './applyResizeRight.js';
import { applyResizeLeft } from './applyResizeLeft.js';
import { handleMove } from './handleMove.js';
import { applyMove } from './applyMove.js';
import { editBar } from '../utils/ui/barEdit.js';
import { renderBar } from './render.js';
export { renderBar, editBar, startBarDrag };
function startBarDrag(e, fullId, mode, state, render) {
    const { projectData, zoomLevel, foldedIds } = state;
    const dragStartX = e.clientX;
    const dragStartY = e.clientY;
    const draggedTask = gantt.findTask(projectData.roots, fullId);
    const barEl = e.target.closest('.bar');
    if (!barEl) return;
    const originalLeft = parseFloat(barEl.style.left);
    const originalWidth = parseFloat(barEl.style.width);
    const rowHeight = 24; 
    const flat = gantt.flattenTasks(projectData.roots, 0, "", { 
        baseDate: projectData.baseDate, 
        foldedIds: foldedIds 
    });
    const flatTask = flat.find(t => t.fullId === fullId);
    if (!flatTask) return;
    const originalDuration = flatTask.duration || 1;
    const originalStart = new Date(flatTask.calculatedStart + 'T00:00:00');
    const move = (me) => {
        if (mode === 'resize-right') {
            handleResizeRight(me, barEl, originalWidth, dragStartX, zoomLevel);
        } else if (mode === 'resize-left') {
            handleResizeLeft(me, barEl, originalLeft, originalWidth, dragStartX, zoomLevel);
        } else if (mode === 'move') {
            handleMove(me, barEl, originalLeft, dragStartX, dragStartY);
        }
    };
    const up = (me) => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        if (mode === 'resize-right') {
            applyResizeRight(me, draggedTask, originalDuration, dragStartX, zoomLevel);
        } else if (mode === 'resize-left') {
            applyResizeLeft(me, draggedTask, originalDuration, originalStart, dragStartX, zoomLevel);
        } else if (mode === 'move') {
            applyMove(me, draggedTask, originalStart, dragStartX, dragStartY, zoomLevel, rowHeight, projectData, fullId, flat);
        }
        render();
        if (window.app && typeof window.app.updateTask === 'function') {
            window.app.updateTask(fullId, 'duration', draggedTask.duration);
            if (mode === 'resize-left') window.app.updateTask(fullId, 'start', draggedTask.start);
        }
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
}
