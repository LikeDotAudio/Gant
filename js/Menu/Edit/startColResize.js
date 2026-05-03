import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { updateNav } from '../../core/clientWorker.js';

export function startColResize(e, col) {
    e.preventDefault(); 
    e.stopPropagation(); 
    state.isResizingCol = true;
    const startX = e.clientX; 
    const startWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--${col}-w`)) || 0;
    
    const onMouseMove = (me) => {
        document.documentElement.style.setProperty(`--${col}-w`, `${Math.max(10, startWidth + (me.clientX - startX))}px`);
        render(false); 
        if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel);
    };
    
    const onMouseUp = () => { 
        window.removeEventListener('mousemove', onMouseMove); 
        window.removeEventListener('mouseup', onMouseUp); 
        document.body.style.cursor = 'default'; 
    };
    
    window.addEventListener('mousemove', onMouseMove, { passive: true }); 
    window.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
}
