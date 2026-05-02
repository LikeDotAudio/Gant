/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/timeline functionality.
 */

export function addMilestone(e, minDateStr, projectData, zoomLevel, el, render) {
    e.stopPropagation();
    const timeline = e.target.closest('.gantt-timeline');
    if (!timeline || !minDateStr) return;
    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const mDate = new Date(minDateStr);
    if (isNaN(mDate.getTime())) return;

    mDate.setDate(mDate.getDate() + Math.floor(x / zoomLevel));
    if (isNaN(mDate.getTime())) return;
    
    el.overlay.style.display = 'flex';
    el.overlayTitle.innerText = "Milestone Name";
    el.overlayInput.value = "New Milestone";
    el.overlayInput.focus();
    el.overlayInput.select();
    
    el.overlayOk.onclick = () => {
        if (el.overlayInput.value) {
            if (!projectData.milestones) projectData.milestones = [];
            projectData.milestones.push({
                date: mDate.toISOString().split('T')[0],
                name: el.overlayInput.value
            });
            render();
            // Notify app to persist state
            if (window.app && typeof window.app.updateTask === 'function') {
                window.app.updateTask('milestone', 'dummy', null); 
            }
        }
        el.overlay.style.display = 'none';
    };
}
