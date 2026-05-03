/**
 * js/Menu/Edit/updateTask.js
 * Logic for updating specific fields of a task and managing cascading side effects.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { persistState } from '../../utils/persistence.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';
import { TIME } from '../../core/constants.js';

/**
 * Updates a specific property of a task and refreshes the application state.
 * 
 * @param {string} taskFullId - The ID of the task to update.
 * @param {string} fieldName - The property name to change (e.g., 'name', 'duration', 'start').
 * @param {any} newValue - The new value to assign to the field.
 */
export function updateTask(taskFullId, fieldName, newValue) {
    console.log(`[State] Task update requested`, { taskFullId, fieldName, newValue });

    const targetTask = gantt.findTask(state.projectData.roots, taskFullId); 
    if (!targetTask) {
        return;
    }

    undoManager.pushState();

    if (fieldName === 'start') {
        targetTask.start = newValue;
    } else if (fieldName === 'progress') {
        targetTask.progress = parseInt(newValue) || 0;
    } else if (fieldName === 'duration') {
        targetTask.duration = parseFloat(newValue) || 0;
    } else if (fieldName === 'end') {
        // Calculate duration based on the new end date and current calculated start
        const flatTaskRepresentation = state.flatTasks.find(task => task.fullId === taskFullId);
        if (flatTaskRepresentation) {
            const startDate = new Date(flatTaskRepresentation.calculatedStart); 
            const newEndDate = new Date(newValue);
            const durationInMs = newEndDate - startDate;
            targetTask.duration = Math.max(0, Math.ceil(durationInMs / TIME.MILLISECONDS_PER_DAY));
        }
    } else { 
        targetTask[fieldName] = newValue; 
    }

    // Refresh the view and persist changes
    render(); 
    persistState();
}
