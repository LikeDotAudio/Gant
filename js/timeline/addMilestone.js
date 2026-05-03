export function addMilestone(e, minDateStr, projectData, zoomLevel, el, render) {
    if (e && e.stopPropagation) e.stopPropagation();
    
    let mDate;
    const timeline = e?.target?.closest?.('.gantt-timeline');
    
    if (timeline && minDateStr) {
        const rect = timeline.getBoundingClientRect();
        const x = e.clientX - rect.left;
        mDate = new Date(minDateStr);
        if (!isNaN(mDate.getTime())) {
            mDate.setDate(mDate.getDate() + Math.floor(x / zoomLevel));
        }
    }

    if (!mDate || isNaN(mDate.getTime())) {
        // Fallback: use project base date or today
        mDate = new Date(projectData.baseDate || new Date());
    }

    if (isNaN(mDate.getTime())) return;
    
    el.overlay.style.display = 'flex';
    el.overlayTitle.innerText = "Add Milestone";
    const overlayFields = el.overlay.querySelector('#overlay-fields');
    if (overlayFields) {
        Array.from(overlayFields.children).forEach(child => {
            if (child.innerText.includes('Name:')) {
                child.style.display = 'flex';
            } else if (child.innerHTML.includes('overlay-start')) {
                child.style.display = 'flex';
                const startInput = document.getElementById('overlay-start');
                if (startInput) {
                    startInput.value = mDate.toISOString().split('T')[0];
                    startInput.parentElement.firstChild.textContent = "Date: ";
                }
                const stopLabel = document.getElementById('overlay-end')?.parentElement;
                if (stopLabel) stopLabel.style.display = 'none';
            } else {
                child.style.display = 'none';
            }
        });
    }
    
    el.overlayInput.value = "New Milestone";
    el.overlayInput.focus();
    el.overlayInput.select();
    
    el.overlayOk.onclick = () => {
        const startInput = document.getElementById('overlay-start');
        const finalDate = startInput ? startInput.value : mDate.toISOString().split('T')[0];
        
        if (el.overlayInput.value) {
            if (!projectData.milestones) projectData.milestones = [];
            projectData.milestones.push({
                date: finalDate,
                name: el.overlayInput.value
            });
            render();
            // Notify app to persist state
            if (window.app && typeof window.app.updateTask === 'function') {
                window.app.updateTask('milestone', 'dummy', null); 
            }
        }
        resetOverlay(el);
    };

    el.overlayCancel.onclick = () => {
        resetOverlay(el);
    };
}

function resetOverlay(el) {
    el.overlay.style.display = 'none';
    const overlayFields = el.overlay.querySelector('#overlay-fields');
    if (overlayFields) {
        Array.from(overlayFields.children).forEach(child => child.style.display = '');
        const startInput = document.getElementById('overlay-start');
        if (startInput) {
            startInput.parentElement.firstChild.textContent = "Start: ";
        }
        const stopLabel = document.getElementById('overlay-end')?.parentElement;
        if (stopLabel) stopLabel.style.display = 'flex';
    }
}
