import * as gantt from '../Rows/index.js';
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
        // Notify app to persist state
        if (window.app && typeof window.app.updateTask === 'function') {
            window.app.updateTask(fullId, 'dummy', null); 
        }
    };
}
