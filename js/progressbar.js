import * as gantt from './gantt.js';

export function startBarDrag(e, fullId, mode, state, render) {
    const { projectData, zoomLevel, foldedIds } = state;
    const dragStartX = e.clientX;
    const draggedTask = gantt.findTask(projectData.roots, fullId);
    
    // Find the specific bar element in the DOM
    const barEl = e.currentTarget; 
    const originalLeft = parseFloat(barEl.style.left);
    const originalWidth = parseFloat(barEl.style.width);

    const flat = gantt.flattenTasks(projectData.roots, 0, "", { 
        baseDate: projectData.baseDate, 
        foldedIds: foldedIds 
    });
    const flatTask = flat.find(t => t.fullId === fullId);
    if (!flatTask) return;

    const originalDuration = flatTask.duration || 1;
    const originalStart = new Date(flatTask.calculatedStart + 'T00:00:00');

    const move = (me) => {
        const deltaX = me.clientX - dragStartX;
        
        // 1. DIRECT DOM UPDATE (Fast)
        // Instead of re-rendering everything, just move the current element
        if (mode === 'resize-right') {
            const newWidth = Math.max(zoomLevel, originalWidth + deltaX);
            barEl.style.width = `${newWidth}px`;
        } else if (mode === 'move') {
            barEl.style.left = `${originalLeft + deltaX}px`;
        }
    };

    const up = (me) => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);

        // 2. DEFERRED CALCULATION (Wait until finished)
        const dayDelta = Math.round((me.clientX - dragStartX) / zoomLevel);
        if (mode === 'resize-right') {
            const d = originalDuration + dayDelta;
            if (d >= 1) draggedTask.duration = d;
        } else if (mode === 'move') {
            const newDate = new Date(originalStart);
            newDate.setDate(newDate.getDate() + dayDelta);
            draggedTask.start = newDate.toISOString().split('T')[0];
            draggedTask.duration = originalDuration;
        }
        
        // Final single re-render to update dependencies and summaries
        render();
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
}

export function editBar(fullId, projectData, el, render) {
    const task = gantt.findTask(projectData.roots, fullId);
    if (!task) return;
    
    // Find the flat task to get calculated dates
    const { flat } = gantt.getFlattenedProject(projectData.roots, { baseDate: projectData.baseDate });
    const flatTask = flat.find(t => t.fullId === fullId);

    el.overlay.style.display = 'flex';
    el.overlayTitle.innerText = `Edit: ${task.name}`;
    el.overlayInput.value = task.name;
    el.overlayProgress.value = task.progress || 0;
    document.getElementById('progress-val').innerText = `${task.progress || 0}%`;
    
    const startInput = document.getElementById('overlay-start');
    const endInput = document.getElementById('overlay-end');
    
    if (startInput && endInput && flatTask) {
        startInput.value = flatTask.calculatedStart;
        endInput.value = flatTask.calculatedEnd;
    }

    const palette = [
        '#000000', '#5d4037', '#ff0000', '#ff9800', '#ffff00', 
        '#00ff00', '#2196f3', '#9c27b0', '#9e9e9e', '#ffffff'
    ];

    const grid = document.getElementById('palette-grid');
    grid.innerHTML = '';
    let selectedColor = task.color || "#f4902c";

    palette.forEach(c => {
        const div = document.createElement('div');
        div.className = 'palette-color';
        div.style.backgroundColor = c;
        if (c.toLowerCase() === selectedColor.toLowerCase()) div.classList.add('active');
        div.onclick = () => {
            selectedColor = c;
            grid.querySelectorAll('.palette-color').forEach(x => x.classList.remove('active'));
            div.classList.add('active');
        };
        grid.appendChild(div);
    });
    
    el.overlayOk.onclick = () => {
        task.name = el.overlayInput.value;
        task.progress = parseInt(el.overlayProgress.value);
        task.color = selectedColor;
        
        if (startInput && endInput) {
            task.start = startInput.value;
            const sDate = new Date(startInput.value + 'T00:00:00');
            const eDate = new Date(endInput.value + 'T00:00:00');
            if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
                task.duration = Math.max(1, Math.ceil((eDate - sDate) / 86400000));
            }
        }

        render();
        el.overlay.style.display = 'none';
    };
}
