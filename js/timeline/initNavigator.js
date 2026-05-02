import { renderNav } from './renderNav.js';

/**
 * Mini-map Navigator for Gantt Chart
 * Provides a 150x250 overview in the bottom right.
 * 
 * @param {HTMLElement} containerEl 
 * @param {HTMLElement} ganttChartEl 
 * @returns {Function} update function
 */
export function initNavigator(containerEl, ganttChartEl) {
    let navContainer = document.getElementById('gantt-navigator');
    
    if (!navContainer) {
        navContainer = document.createElement('div');
        navContainer.id = 'gantt-navigator';
        navContainer.innerHTML = `
            <div id="nav-resize-handle"></div>
            <canvas id="nav-canvas" width="150" height="250"></canvas>
            <div id="nav-viewport"></div>
        `;
        document.body.appendChild(navContainer);
    }

    const canvas = document.getElementById('nav-canvas');
    const viewport = document.getElementById('nav-viewport');
    const resizeHandle = document.getElementById('nav-resize-handle');
    
    const update = (flatTasks, minStr, maxStr, zoomLevel) => {
        // Sync canvas size with container size if it changed
        if (canvas.width !== navContainer.clientWidth || canvas.height !== navContainer.clientHeight) {
            canvas.width = navContainer.clientWidth;
            canvas.height = navContainer.clientHeight;
        }
        renderNav(canvas, viewport, containerEl, ganttChartEl, flatTasks, minStr, maxStr, zoomLevel);
    };

    // Resize logic
    resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = navContainer.clientWidth;
        const startH = navContainer.clientHeight;

        const onMouseMove = (me) => {
            const dx = startX - me.clientX;
            const dy = startY - me.clientY;
            const newW = Math.max(100, startW + dx);
            const newH = Math.max(100, startH + dy);
            navContainer.style.width = `${newW}px`;
            navContainer.style.height = `${newH}px`;
            
            const vL = containerEl.scrollLeft * (navContainer.clientWidth / ganttChartEl.scrollWidth);
            const vT = containerEl.scrollTop * (navContainer.clientHeight / ganttChartEl.scrollHeight);
            viewport.style.left = `${vL}px`;
            viewport.style.top = `${vT}px`;
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            
            if (window.app && typeof window.app.renderNavigator === 'function') {
                window.app.renderNavigator();
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    containerEl.addEventListener('scroll', () => {
        const vL = containerEl.scrollLeft * (canvas.width / ganttChartEl.scrollWidth);
        const vT = containerEl.scrollTop * (canvas.height / ganttChartEl.scrollHeight);
        viewport.style.left = `${vL}px`;
        viewport.style.top = `${vT}px`;
    });

    // Allow clicking/dragging on navigator to scroll main view
    navContainer.addEventListener('mousedown', (e) => {
        const handleMove = (me) => {
            const rect = navContainer.getBoundingClientRect();
            const x = (me.clientX - rect.left) / rect.width;
            const y = (me.clientY - rect.top) / rect.height;
            
            containerEl.scrollLeft = x * ganttChartEl.scrollWidth - (containerEl.clientWidth / 2);
            containerEl.scrollTop = y * ganttChartEl.scrollHeight - (containerEl.clientHeight / 2);
        };
        
        const handleUp = () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
        
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        handleMove(e);
    });

    return update;
}
