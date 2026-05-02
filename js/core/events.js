import { el } from './elements.js';
import { state } from './state.js';
import { render } from './render.js';
import { updateNav } from './worker-client.js';
import { showStatus } from '../StatusBar/Status_update.js';
import { handleKeyboard } from '../handlers/keyboard.js';
import { handleGanttClick } from '../handlers/gantt-click.js';
import { handleGanttChange } from '../handlers/gantt-change.js';
import { handleGanttMouseDown } from '../handlers/gantt-mousedown.js';
import { handleGanttDblClick } from '../handlers/gantt-dblclick.js';
import { 
    handleGanttDragStart, 
    handleGanttDragOver, 
    handleGanttDragLeave, 
    handleGanttDrop 
} from '../handlers/gantt-drag.js';
export function setupEventListeners() {
    window.addEventListener('keydown', handleKeyboard);
    el.overlayCancel.onclick = () => { el.overlay.style.display = 'none'; };
    el.overlayProgress.oninput = () => {
        const valSpan = document.getElementById('progress-val');
        if (valSpan) valSpan.innerText = `${el.overlayProgress.value}%`;
    };
    el.delNo.onclick = () => {
        showStatus("Delete cancelled.");
    };
    if (el.ganttChart) {
        const container = document.getElementById('gantt-container');
        if (container) {
            let scrollTimeout;
            container.addEventListener('scroll', () => {
                if (state.currentView === 'visual') {
                    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
                    scrollTimeout = requestAnimationFrame(() => {
                        render(false);
                        if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel);
                    });
                }
            }, { passive: true });
            container.addEventListener('wheel', (e) => {
                const overTimeline = e.target.closest('.gantt-timeline');
                if (e.ctrlKey || overTimeline) {
                    e.preventDefault();
                    window.app.zoom(e.deltaY > 0 ? -10 : 10);
                }
            }, { passive: false });
            let isPanning = false;
            let startX, startY, startScrollLeft, startScrollTop;
            container.addEventListener('mousedown', (e) => {
                if (e.button === 1) {
                    isPanning = true;
                    startX = e.clientX; startY = e.clientY;
                    startScrollLeft = container.scrollLeft; startScrollTop = container.scrollTop;
                    container.style.cursor = 'grabbing';
                    e.preventDefault();
                }
            });
            window.addEventListener('mousemove', (e) => {
                if (isPanning) {
                    container.scrollLeft = startScrollLeft - (e.clientX - startX);
                    container.scrollTop = startScrollTop - (e.clientY - startY);
                    if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel);
                }
            });
            window.addEventListener('mouseup', (e) => {
                if (e.button === 1) { isPanning = false; container.style.cursor = 'auto'; }
            });
        }
        el.ganttChart.addEventListener('click', handleGanttClick);
        el.ganttChart.addEventListener('change', handleGanttChange);
        el.ganttChart.addEventListener('mousedown', handleGanttMouseDown);
        el.ganttChart.addEventListener('dblclick', handleGanttDblClick);
        el.ganttChart.addEventListener('mousemove', (e) => {
            const isTimeline = e.target.closest('.gantt-timeline') || e.target.closest('.task-bars-cell');
            const hoverLine = el.ganttChart.querySelector('.hover-line');
            if (isTimeline && hoverLine) {
                const rect = el.ganttChart.getBoundingClientRect();
                hoverLine.style.left = `${e.clientX - rect.left}px`;
                hoverLine.style.display = 'block';
            } else if (hoverLine) { hoverLine.style.display = 'none'; }
        });
        el.ganttChart.addEventListener('dragstart', handleGanttDragStart);
        el.ganttChart.addEventListener('dragover', handleGanttDragOver);
        el.ganttChart.addEventListener('dragleave', handleGanttDragLeave);
        el.ganttChart.addEventListener('drop', handleGanttDrop);
        el.ganttChart.addEventListener('mouseover', (e) => {
            const bar = e.target.closest('.bar');
            if (bar) { const row = bar.closest('.gantt-row'); if (row) row.draggable = false; }
        });
        el.ganttChart.addEventListener('mouseout', (e) => {
            const bar = e.target.closest('.bar');
            if (bar) { const row = bar.closest('.gantt-row'); if (row) row.draggable = true; }
        });
    }
}
