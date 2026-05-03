import { el } from './elements.js';
import { state } from './state.js';
import { render } from './render.js';
import { updateNav } from './clientWorker.js';
import { showStatus } from '../StatusBar/updateStatus.js';
import { handleKeyboard } from '../actions/keyboard/keyboard.js';
import { clickMouse } from '../actions/mouse/clickMouse.js';
import { changeMouse } from '../actions/mouse/changeMouse.js';
import { mouseDownMouse } from '../actions/mouse/mouseDownMouse.js';
import { dblClickMouse } from '../actions/mouse/dblClickMouse.js';
import { 
    dragStartMouse, 
    dragOverMouse, 
    dragLeaveMouse, 
    dropMouse 
} from '../actions/mouse/dragMouse.js';
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
                        if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel, state.projectData.milestones);
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
                    if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel, state.projectData.milestones);
                }
            });
            window.addEventListener('mouseup', (e) => {
                if (e.button === 1) { isPanning = false; container.style.cursor = 'auto'; }
            });
        }
        el.ganttChart.addEventListener('click', clickMouse);
        el.ganttChart.addEventListener('change', changeMouse);
        el.ganttChart.addEventListener('mousedown', mouseDownMouse);
        el.ganttChart.addEventListener('dblclick', dblClickMouse);
        el.ganttChart.addEventListener('mousemove', (e) => {
            const isTimeline = e.target.closest('.gantt-timeline') || e.target.closest('.task-bars-cell');
            const hoverLine = el.ganttChart.querySelector('.hover-line');
            if (isTimeline && hoverLine) {
                const rect = el.ganttChart.getBoundingClientRect();
                hoverLine.style.left = `${e.clientX - rect.left}px`;
                hoverLine.style.display = 'block';
            } else if (hoverLine) { hoverLine.style.display = 'none'; }
        });
        el.ganttChart.addEventListener('dragstart', dragStartMouse);
        el.ganttChart.addEventListener('dragover', dragOverMouse);
        el.ganttChart.addEventListener('dragleave', dragLeaveMouse);
        el.ganttChart.addEventListener('drop', dropMouse);
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
