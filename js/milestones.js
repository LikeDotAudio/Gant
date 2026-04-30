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
        }
        el.overlay.style.display = 'none';
    };
}

export function startMilestoneDrag(e, index, projectData, zoomLevel, render) {
    e.stopPropagation();
    const milestone = projectData.milestones[index];
    if (!milestone) return;
    const originalDate = new Date(milestone.date + 'T00:00:00');
    const startX = e.clientX;
    
    // Find the milestone container element
    const container = e.target.closest('.milestone-container');
    if (!container) return;

    const move = (me) => {
        const deltaX = me.clientX - startX;
        // Direct DOM update of the container position (Butter Smooth)
        container.style.transform = `translateX(${deltaX}px)`;
    };

    const up = (me) => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);

        const dayDelta = Math.round((me.clientX - startX) / zoomLevel);
        const newDate = new Date(originalDate);
        newDate.setDate(newDate.getDate() + dayDelta);
        milestone.date = newDate.toISOString().split('T')[0];
        
        // Final re-render to snap to grid and update date labels
        render();
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
}
