/**
 * js/actions/keyboard/foldKeyboard.js
 * Handles horizontal arrow key interactions for folding/unfolding and navigating hierarchy.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as gantt from '../../Rows/index.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Smart folding for keyboard navigation.
 * ArrowLeft: Folds the selected item. If already folded or no children, selects the parent.
 * ArrowRight: Unfolds the selected item.
 * 
 * @param {KeyboardEvent} keyboardEvent - The browser's native keyboard event.
 * @param {Array<Object>} projectRoots - The hierarchical project structure.
 * @param {Set<string>} foldedIdsSet - The set of IDs currently in a folded state.
 * @param {string} currentlySelectedTaskId - The full ID of the task receiving the command.
 * @returns {boolean} - Returns true if the folding/unfolding action was handled.
 */
export function foldKeyboard(keyboardEvent, projectRoots, foldedIdsSet, currentlySelectedTaskId) {
    const isArrowLeft = keyboardEvent.key === 'ArrowLeft';
    const isArrowRight = keyboardEvent.key === 'ArrowRight';

    if (!isArrowLeft && !isArrowRight) {
        return false;
    }
    
    // Prevent browser horizontal scrolling when a task is selected
    keyboardEvent.preventDefault();

    const targetTask = gantt.findTask(projectRoots, currentlySelectedTaskId);
    if (!targetTask) {
        return true;
    }
    
    undoManager.pushState();

    const childrenList = gantt.getChildren(targetTask);
    const hasChildrenToFold = childrenList && childrenList.length > 0;
    
    if (isArrowLeft) {
        if (hasChildrenToFold && !foldedIdsSet.has(currentlySelectedTaskId)) {
            // Fold the current item
            foldedIdsSet.add(currentlySelectedTaskId);
            render();
            return true;
        } else {
            // Already folded or no children: navigate to the parent
            const parentFullId = gantt.getFullIdOfParent(projectRoots, currentlySelectedTaskId);
            if (parentFullId) {
                state.selectedTaskFullIds.clear();
                state.selectedTaskFullIds.add(parentFullId);
                render(false);
            }
            return true;
        }
    } else if (isArrowRight) {
        if (hasChildrenToFold && foldedIdsSet.has(currentlySelectedTaskId)) {
            // Unfold the current item
            foldedIdsSet.delete(currentlySelectedTaskId);
            render();
            return true;
        }
    }
    
    return true;
}
