import { state } from '../core/state.js';
import { render } from '../core/render.js';
import * as gantt from '../Rows/index.js';
import * as columns from '../columns/index.js';

const { fold } = columns;

export function handleKeyboard(e) {
    if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;
    if (state.currentView !== 'visual') return;

    if (e.key === 'Enter' && state.selectedTaskFullId) {
        window.app.editTask(state.selectedTaskFullId);
        return;
    }

    if (!e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        const flat = state.flatTasks;
        if (!flat || flat.length === 0) return;
        let newIdx = 0;
        if (state.selectedTaskFullId) {
            const currentIdx = flat.findIndex(t => t.fullId === state.selectedTaskFullId);
            if (e.key === 'ArrowUp') newIdx = (currentIdx - 1 + flat.length) % flat.length;
            else newIdx = (currentIdx + 1) % flat.length;
        }
        state.selectedTaskFullId = flat[newIdx].fullId;
        e.preventDefault(); render(false); return;
    }

    if (!e.ctrlKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        if (!state.selectedTaskFullId) return;
        const result = fold.keyboardFold(state.projectData.roots, state.foldedIds, state.selectedTaskFullId, e.key === 'ArrowLeft' ? 'left' : 'right');
        
        if (result.newSelection) {
            state.selectedTaskFullId = result.newSelection;
            e.preventDefault(); render(false);
        } else if (result.changed) {
            e.preventDefault(); render();
        }
        return;
    }

    if (!state.selectedTaskFullId) return;
    const taskToMove = gantt.findTask(state.projectData.roots, state.selectedTaskFullId);
    if (!taskToMove) return;
    const { parent: currentParent } = gantt.findParentAndIndex(state.projectData.roots, state.selectedTaskFullId);
    if (!currentParent) return;

    let changed = false;
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

    if (changed) {
        e.preventDefault();
        gantt.refreshIds(state.projectData.roots);
        state.selectedTaskFullId = gantt.findFullId(state.projectData.roots, taskToMove);
        render(true);
    }
}
