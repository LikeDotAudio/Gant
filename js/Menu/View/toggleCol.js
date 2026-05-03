/**
 * js/Menu/View/toggleCol.js
 * Controls the visibility of specific columns in the Gantt spreadsheet view.
 */

import * as columnOperations from '../../columns/index.js';

/**
 * Toggles a column's visibility on or off.
 * 
 * @param {string} columnIdentifier - Internal ID of the column (e.g., 'dur', 'start').
 * @param {boolean} isCurrentlyChecked - Whether the column should be visible.
 */
export function toggleCol(columnIdentifier, isCurrentlyChecked) { 
    columnOperations.manager.toggleCol(columnIdentifier, isCurrentlyChecked); 
}
