/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/timeline functionality.
 */

export function startMilestoneDrag(e, index, projectData, zoomLevel, render) {
    e.stopPropagation();
    const milestone = projectData.milestones[index];
    if (!milestone) return;
    const originalDate = new Date(milestone.date + 'T00:00:00');
    const startX = e.clientX;
    
    // Find the milestone container element
    const container = e.target.closest('.milestone-container');
    if (!container) return;

    // Prevent text selection and other interactions during drag
    document.body.style.cursor = 'ew-resize';
    container.style.zIndex = '1000'; // Bring to front during drag

    const move = (me) => {
        const deltaX = me.clientX - startX;
        container.style.transform = `translateX(${deltaX}px)`;
    };

    const up = (me) => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
        document.body.style.cursor = '';
        container.style.zIndex = '';

        const dayDelta = Math.round((me.clientX - startX) / zoomLevel);
        if (dayDelta !== 0) {
            const newDate = new Date(originalDate);
            newDate.setDate(newDate.getDate() + dayDelta);
            milestone.date = newDate.toISOString().split('T')[0];
        }
        
        container.style.transform = '';
        render();

        // Notify app to persist state
        if (window.app && typeof window.app.updateTask === 'function') {
            window.app.updateTask('milestone', 'dummy', null); 
        }
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
}
