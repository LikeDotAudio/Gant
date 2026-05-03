import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Handles modified keyboard input events (with Ctrl/Cmd).
 * 
 * @param {Event} e - The keyboard event.
 * @returns {boolean} - Whether the event was handled.
 */
export function handleKeyboardMove(e) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return false;
    
    // Prevent browser default scroll/navigation behavior for modified arrow keys
    e.preventDefault();

    if (state.selectedTaskFullIds.size === 0) return true;
    
    const firstSelectedId = Array.from(state.selectedTaskFullIds)[0];
    const taskToMove = gantt.findTask(state.projectData.roots, firstSelectedId);
    if (!taskToMove) return true;
    
    const { parent: currentParent } = gantt.findParentAndIndex(state.projectData.roots, firstSelectedId);
    if (!currentParent) return true;
    
    // Push state before any potential change
    undoManager.pushState();

    let changed = false;
    if (e.key === 'ArrowRight') {
        changed = gantt.shift.shiftItem(state.projectData.roots, firstSelectedId, 'right');
    } else if (e.key === 'ArrowLeft') {
        changed = gantt.shift.shiftItem(state.projectData.roots, firstSelectedId, 'left');
    } else if (e.key === 'ArrowUp') {
        changed = gantt.up.moveUp(state.projectData.roots, firstSelectedId);
    } else if (e.key === 'ArrowDown') {
        changed = gantt.down.moveDown(state.projectData.roots, firstSelectedId);
    }

    if (changed) {
        gantt.refreshIds(state.projectData.roots);
        const newFullId = gantt.findFullId(state.projectData.roots, taskToMove);
        state.selectedTaskFullIds.clear();
        state.selectedTaskFullIds.add(newFullId);
        render(true);
    }
    
    return true;
}
