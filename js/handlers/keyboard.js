import { state } from '../core/state.js';
import { render } from '../core/render.js';
import * as gantt from '../Rows/index.js';
import * as columns from '../columns/index.js';
import { handleF2 } from './F2.js';

const { fold } = columns;

/**
 * Handles keyboard input events, providing shortcut support for task selection,
 * navigation, folding, and moving tasks.
 * 
 * @param {Event} e - The keyboard event.
 */
export function handleKeyboard(e) {
    console.log(`[handleKeyboard] Event triggered`, { type: e.type, key: e.key });
    if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
    if (state.currentView !== 'visual') return;

    if (e.key === 'F2') {
        handleF2();
        return;
    }

    if (e.key === 'Enter' && state.selectedTaskFullId) {
        window.app.editTask(state.selectedTaskFullId);
        return;
    }

    if (!e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        const flat = state.flatTasks;
        if (!flat || flat.length === 0) return;
        
        let newIdx = 0;
        if (state.selectedTaskFullIds.size > 0) {
            const lastSelectedId = Array.from(state.selectedTaskFullIds)[state.selectedTaskFullIds.size - 1];
            const currentIdx = flat.findIndex(t => t.fullId === lastSelectedId);
            if (e.key === 'ArrowUp') newIdx = (currentIdx - 1 + flat.length) % flat.length;
            else newIdx = (currentIdx + 1) % flat.length;
        }

        state.selectedTaskFullIds.clear();
        state.selectedTaskFullIds.add(flat[newIdx].fullId);
        
        e.preventDefault(); 
        render(false); 
        return;
    }

    if (!e.ctrlKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        if (!state.selectedTaskFullId) return;
        const result = fold.keyboardFold(state.projectData.roots, state.foldedIds, state.selectedTaskFullId, e.key === 'ArrowLeft' ? 'left' : 'right');
        
        if (result.newSelection) {
            state.selectedTaskFullId = result.newSelection;
            e.preventDefault(); 
            render(false);
        } else if (result.changed) {
            e.preventDefault(); 
            render();
        }
        return;
    }

    if (state.selectedTaskFullIds.size === 0) return;
    const firstSelectedId = Array.from(state.selectedTaskFullIds)[0];
    const taskToMove = gantt.findTask(state.projectData.roots, firstSelectedId);
    if (!taskToMove) return;
    
    const { parent: currentParent } = gantt.findParentAndIndex(state.projectData.roots, firstSelectedId);
    if (!currentParent) return;
    
    let changed = false;
    if (e.ctrlKey) {
        if (e.key === 'ArrowRight') {
            changed = gantt.shift.shiftItem(state.projectData.roots, firstSelectedId, 'right');
        } else if (e.key === 'ArrowLeft') {
            changed = gantt.shift.shiftItem(state.projectData.roots, firstSelectedId, 'left');
        } else if (e.key === 'ArrowUp') {
            changed = gantt.up.moveUp(state.projectData.roots, firstSelectedId);
        } else if (e.key === 'ArrowDown') {
            changed = gantt.down.moveDown(state.projectData.roots, firstSelectedId);
        }
    }

    if (changed) {
        e.preventDefault();
        gantt.refreshIds(state.projectData.roots);
        const newFullId = gantt.findFullId(state.projectData.roots, taskToMove);
        state.selectedTaskFullIds.clear();
        state.selectedTaskFullIds.add(newFullId);
        render(true);
    }
}
