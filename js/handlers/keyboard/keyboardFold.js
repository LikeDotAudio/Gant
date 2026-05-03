import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Smart folding for keyboard navigation.
 * ArrowLeft: Fold selected item. If already folded or no children, select parent.
 * ArrowRight: Unfold selected item.
 * 
 * @param {Event} e - The keyboard event.
 * @param {Array} roots 
 * @param {Set} foldedIds 
 * @param {string} selectedId 
 * @returns {boolean} - Whether the event was handled.
 */
export function handleKeyboardFold(e, roots, foldedIds, selectedId) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return false;
    
    // Prevent browser horizontal scrolling when a task is selected
    e.preventDefault();

    const direction = e.key === 'ArrowLeft' ? 'left' : 'right';
    const task = gantt.findTask(roots, selectedId);
    if (!task) return true;
    
    undoManager.pushState();

    const hasChildren = gantt.getChildren(task)?.length > 0;
    
    if (direction === 'left') {
        if (hasChildren && !foldedIds.has(selectedId)) {
            foldedIds.add(selectedId);
            render();
            return true;
        } else {
            // Select parent
            const parentId = gantt.getFullIdOfParent(roots, selectedId);
            if (parentId) {
                state.selectedTaskFullIds.clear();
                state.selectedTaskFullIds.add(parentId);
                render(false);
            }
            return true;
        }
    } else if (direction === 'right') {
        if (hasChildren && foldedIds.has(selectedId)) {
            foldedIds.delete(selectedId);
            render();
            return true;
        }
    }
    
    return true;
}
