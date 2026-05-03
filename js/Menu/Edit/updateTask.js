import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { persistState } from '../../utils/persistence.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';

export function updateTask(fullId, field, value) {
    console.log(`[apiName] State change`, { fullId, field, value });
    const task = gantt.findTask(state.projectData.roots, fullId); 
    if (!task) return;
    undoManager.pushState();
    if (field === 'start') task.start = value;
    else if (field === 'progress') task.progress = parseInt(value) || 0;
    else if (field === 'duration') task.duration = parseFloat(value) || 0;
    else if (field === 'end') {
        const flatTask = state.flatTasks.find(ft => ft.fullId === fullId);
        if (flatTask) {
            const sDate = new Date(flatTask.calculatedStart); 
            const eDate = new Date(value);
            task.duration = Math.max(0, Math.ceil((eDate - sDate) / 86400000));
        }
    } else { 
        task[field] = value; 
    }
    render(); 
    persistState();
}
