/**
 * js/actions/keyboard/moveKeyboard.js
 * Handles keyboard shortcuts for moving tasks (shifting left/right or moving up/down).
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Handles modified keyboard input events (with Ctrl/Cmd).
 * 
 * @param {KeyboardEvent} event - The keyboard event.
 * @returns {boolean} - Whether the event was handled.
 */
export function moveKeyboard(event) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        return false;
    }
    
    // Prevent browser default scroll/navigation behavior for modified arrow keys
    event.preventDefault();

    if (state.selectedTaskFullIds.size === 0) {
        return true;
    }
    
    const firstSelectedFullId = Array.from(state.selectedTaskFullIds)[0];
    const task = gantt.findTask(state.projectData.roots, firstSelectedFullId);
    if (!task) {
        return true;
    }
    
    const { parent: currentParent } = gantt.findParentAndIndex(state.projectData.roots, firstSelectedFullId);
    if (!currentParent) {
        return true;
    }
    
    // Push state before any potential change
    undoManager.pushState();

    let hasChanged = false;
    if (event.key === 'ArrowRight') {
        hasChanged = gantt.shift.shiftItem(state.projectData.roots, firstSelectedFullId, 'right');
    } else if (event.key === 'ArrowLeft') {
        hasChanged = gantt.shift.shiftItem(state.projectData.roots, firstSelectedFullId, 'left');
    } else if (event.key === 'ArrowUp') {
        hasChanged = gantt.up.moveUp(state.projectData.roots, firstSelectedFullId);
    } else if (event.key === 'ArrowDown') {
        hasChanged = gantt.down.moveDown(state.projectData.roots, firstSelectedFullId);
    }

    if (hasChanged) {
        gantt.refreshIds(state.projectData.roots);
        const newFullId = gantt.findFullId(state.projectData.roots, task);
        state.selectedTaskFullIds.clear();
        state.selectedTaskFullIds.add(newFullId);
        render(true);
    }
    
    return true;
}
