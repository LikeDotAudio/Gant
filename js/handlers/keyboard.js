/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Manages global keyboard shortcuts for navigation and interaction within the Gantt view.
 */

import { state } from '../core/state.js';
import { render } from '../core/render.js';
import * as gantt from '../Rows/index.js';
import * as columns from '../columns/index.js';

const { fold } = columns;

/**
 * Handles keyboard input events, providing shortcut support for task selection,
 * navigation, folding, and moving tasks.
 * 
 * @param {Event} e - The keyboard event.
 * @returns {void}
 */
export function handleKeyboard(e) {
    // 1. Ignore inputs: Do not interfere with standard typing in input fields or text areas.
    if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
    // 2. View constraint: Only enable shortcuts when the visual Gantt view is active.
    if (state.currentView !== 'visual') return;

    // 3. Selection/Action: Pressing 'Enter' opens the selected task for editing.
    if (e.key === 'Enter' && state.selectedTaskFullId) {
        window.app.editTask(state.selectedTaskFullId);
        return;
    }

    // 4. Vertical Navigation: Navigate between tasks in the flattened list.
    if (!e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        const flat = state.flatTasks;
        if (!flat || flat.length === 0) return;
        let newIdx = 0;
        if (state.selectedTaskFullId) {
            const currentIdx = flat.findIndex(t => t.fullId === state.selectedTaskFullId);
            // Cycle through tasks: ArrowUp moves to previous, ArrowDown to next.
            if (e.key === 'ArrowUp') newIdx = (currentIdx - 1 + flat.length) % flat.length;
            else newIdx = (currentIdx + 1) % flat.length;
        }
        state.selectedTaskFullId = flat[newIdx].fullId;
        e.preventDefault(); render(false); return;
    }

    // 5. Horizontal Navigation/Folding: Use arrows to collapse or expand groups.
    if (!e.ctrlKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        if (!state.selectedTaskFullId) return;
        const result = fold.keyboardFold(state.projectData.roots, state.foldedIds, state.selectedTaskFullId, e.key === 'ArrowLeft' ? 'left' : 'right');
        
        // If the action results in a new selection or a folder state change, re-render the view.
        if (result.newSelection) {
            state.selectedTaskFullId = result.newSelection;
            e.preventDefault(); render(false);
        } else if (result.changed) {
            e.preventDefault(); render();
        }
        return;
    }

    // 6. Task Management (Ctrl + Arrows): Perform complex operations on task hierarchy.
    if (!state.selectedTaskFullId) return;
    const taskToMove = gantt.findTask(state.projectData.roots, state.selectedTaskFullId);
    if (!taskToMove) return;
    const { parent: currentParent } = gantt.findParentAndIndex(state.projectData.roots, state.selectedTaskFullId);
    if (!currentParent) return;

    let changed = false;
    // Check for 'Ctrl' key modifier to distinguish movement actions from selection.
    if (e.ctrlKey) {
        if (e.key === 'ArrowRight') {
            changed = gantt.move.shiftItem(state.projectData.roots, state.selectedTaskFullId, 'right');
        } else if (e.key === 'ArrowLeft') {
            changed = gantt.move.shiftItem(state.projectData.roots, state.selectedTaskFullId, 'left');
        } else if (e.key === 'ArrowUp') {
            changed = gantt.move.moveUp(state.projectData.roots, state.selectedTaskFullId);
        } else if (e.key === 'ArrowDown') {
            changed = gantt.move.moveDown(state.projectData.roots, state.selectedTaskFullId);
        }
    }

    // If a modification occurred, refresh IDs to ensure structural integrity and re-render.
    if (changed) {
        e.preventDefault();
        gantt.refreshIds(state.projectData.roots);
        state.selectedTaskFullId = gantt.findFullId(state.projectData.roots, taskToMove);
        render(true);
    }
}
