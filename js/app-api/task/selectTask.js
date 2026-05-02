import { state } from '../../core/state.js';
import { render } from '../../core/render.js';

export function selectTask(fullId, e) { 
    console.log(`[apiName] State change`, { fullId, action: 'selectTask' });

    const isCtrlPressed = e.ctrlKey || e.metaKey; // metaKey is for Cmd on Mac

    if (!isCtrlPressed) {
        // If Ctrl/Cmd is not pressed, clear the selection and add the new task.
        state.selectedTaskFullIds.clear();
        if (fullId) {
            state.selectedTaskFullIds.add(fullId);
        }
    } else {
        // If Ctrl/Cmd is pressed, toggle the selection for the clicked task.
        if (state.selectedTaskFullIds.has(fullId)) {
            state.selectedTaskFullIds.delete(fullId);
        } else {
            if (fullId) {
                state.selectedTaskFullIds.add(fullId);
            }
        }
    }

    render(); 
}
