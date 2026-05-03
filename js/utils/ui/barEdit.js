import * as gantt from '../../Rows/index.js';

export function editBar(fullId, projectData, el, render) {
    const task = gantt.findTask(projectData.roots, fullId);
    if (!task) return;

    // Find the flat task to get calculated dates
    const { flat } = gantt.getFlattenedProject(projectData.roots, { baseDate: projectData.baseDate });
    const flatTask = flat.find(t => t.fullId === fullId);

    el.overlay.style.display = 'flex';
    el.overlayTitle.innerText = `Edit: ${task.name}`;
    el.overlayInput.value = task.name;
    el.overlayInput.focus();
    el.overlayInput.select();
    el.overlayProgress.value = task.progress || 0;
    
    // Set the task ID field
    el.overlayId.value = gantt.getTaskId(task);
    
    // Set the dependency field
    if (el.overlayDep) {
        el.overlayDep.value = task.dependency || '';
    }

    document.getElementById('progress-val').innerText = `${task.progress || 0}%`;

    const startInput = document.getElementById('overlay-start');
    const endInput = document.getElementById('overlay-end');
    if (startInput && endInput && flatTask) {
        startInput.value = flatTask.calculatedStart ? flatTask.calculatedStart.split('T')[0] : '';
        endInput.value = flatTask.calculatedEnd ? flatTask.calculatedEnd.split('T')[0] : '';
    }

    const palette = [
        'none', '#000000', '#5d4037', '#ff0000', '#ff9800', '#ffff00', 
        '#00ff00', '#2196f3', '#9c27b0', '#9e9e9e', '#ffffff'
    ];
    const grid = document.getElementById('palette-grid');
    grid.innerHTML = '';
    let selectedColor = task.color || "none";
    palette.forEach(c => {
        const div = document.createElement('div');
        div.className = 'palette-color';
        if (c === 'none') {
            div.classList.add('res-none');
            div.title = "No Color";
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            div.innerHTML = '<span style="color: #888; transform: rotate(45deg); font-weight: bold;">|</span>';
        } else {
            div.style.backgroundColor = c;
        }
        
        if (c.toLowerCase() === selectedColor.toLowerCase()) div.classList.add('active');
        div.onclick = () => {
            selectedColor = c;
            grid.querySelectorAll('.palette-color').forEach(x => x.classList.remove('active'));
            div.classList.add('active');
        };
        grid.appendChild(div);
    });

    const cleanup = () => {
        el.overlay.style.display = 'none';
        window.removeEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            el.overlayOk.click();
        } else if (e.key === 'Escape') {
            el.overlayCancel.click();
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    el.overlayOk.onclick = () => {
        task.name = el.overlayInput.value;
        task.progress = parseInt(el.overlayProgress.value);
        task.color = selectedColor;
        
        // Update task ID based on the task depth
        const depth = flatTask ? flatTask.depth : 0;
        gantt.setTaskId(task, el.overlayId.value, depth);

        // Update dependency
        if (el.overlayDep) {
            task.dependency = el.overlayDep.value;
        }

        if (startInput && endInput) {
            task.start = startInput.value;
            const sDate = new Date(startInput.value + 'T00:00:00');
            const eDate = new Date(endInput.value + 'T00:00:00');
            if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
                task.duration = Math.max(1, Math.ceil((eDate - sDate) / 86400000));
            }
        }
        
        render();
        cleanup();

        // Notify app to persist state
        if (window.app && typeof window.app.updateTask === 'function') {
            window.app.updateTask(fullId, 'dummy', null); 
        }
    };

    el.overlayCancel.onclick = () => {
        cleanup();
    };
}
