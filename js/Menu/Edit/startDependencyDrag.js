/**
 * js/Menu/Edit/startDependencyDrag.js
 * Bridge function to initiate a dependency connection drag.
 */

import * as progressBarHandlers from '../../progressbar/index.js';

/**
 * Delegates the dependency connection logic to the progress bar module.
 * 
 * @param {MouseEvent} mouseEvent - The mouse event that initiated the drag.
 * @param {string} sourceTaskFullId - The ID of the task where the dependency starts.
 */
export function startDependencyDrag(mouseEvent, sourceTaskFullId) {
    progressBarHandlers.startDependencyDrag(mouseEvent, sourceTaskFullId);
}
