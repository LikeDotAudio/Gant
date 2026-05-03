/**
 * js/Menu/Edit/addBelow.js
 * Provides functionality to add a new task below the currently selected task.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { showStatus } from '../../StatusBar/updateStatus.js';
import { persistState } from '../../utils/persistence.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Adds a new task below the first selected task in the project.
 * It updates the task IDs, maintains the selection on the original task,
 * and triggers a re-render and state persistence.
 * 
 * @returns {void}
 */
export function addBelow() {
    if (state.selectedTaskFullIds.size === 0) { 
        showStatus("No task selected.", true); 
        return; 
    }
    undoManager.pushState();
    const selectedFullId = Array.from(state.selectedTaskFullIds)[0];
    const taskToTrack = gantt.findTask(state.projectData.roots, selectedFullId);
    const result = gantt.add.addBelow(state.projectData.roots, selectedFullId);
    if (result.changed) {
        gantt.refreshIds(state.projectData.roots);
        const newFullId = gantt.findFullId(state.projectData.roots, taskToTrack);
        state.selectedTaskFullIds.clear();
        state.selectedTaskFullIds.add(newFullId);
        render(true); 
        showStatus(`Added task below.`); 
        persistState();
    }
}
