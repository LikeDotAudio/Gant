/**
 * js/Menu/Edit/taskEdit.js
 * Handles opening the task property editor overlay.
 */

import { state } from '../../core/state.js';
import { el } from '../../core/elements.js';
import { render } from '../../core/render.js';
import * as progressBarHandlers from '../../progressbar/index.js';

/**
 * Opens the property editor for a specific task.
 * If no ID is provided, it attempts to use the currently selected task.
 * 
 * @param {string|null} taskFullId - The dot-notated full ID of the task to edit.
 * @param {Event|null} interactionEvent - Optional event that triggered the edit.
 */
export function editTask(taskFullId, interactionEvent) { 
    let targetFullId = taskFullId;

    if (!targetFullId && state.selectedTaskFullIds.size > 0) {
        // Default to the first selected task if none specified
        targetFullId = Array.from(state.selectedTaskFullIds)[0];
    }

    if (targetFullId) {
        progressBarHandlers.editBar(
            targetFullId, 
            state.projectData, 
            el, 
            render
        ); 
    }
}
