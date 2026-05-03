/**
 * js/Menu/View/foldToLevel.js
 * Controls the bulk folding of tasks down to a specific hierarchical depth.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as columnOperations from '../../columns/index.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Folds or unfolds all tasks in the project to match the target nesting level.
 * 
 * @param {number} targetDepth - The depth level to fold to (0=Roots only, etc.)
 */
export function foldToLevel(targetDepth) { 
    undoManager.pushState();
    
    columnOperations.fold.foldToLevel(
        state.projectData.roots, 
        state.foldedIds, 
        targetDepth
    ); 
    
    render(); 
}
