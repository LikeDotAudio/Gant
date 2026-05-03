/**
 * js/Menu/Edit/index.js
 * Entry point for the Edit menu functionality.
 * Exports various task and milestone editing operations, drag-and-drop handlers, and undo management.
 */

export * from './addAbove.js';
export * from './addBelow.js';
export * from './confirmDeleteSelected.js';
export * from './updateTask.js';
export * from './addMilestone.js';
export * from './taskEdit.js';
export * from './rowDragStart.js';
export * from './rowDragOver.js';
export * from './rowDragLeave.js';
export * from './rowDrop.js';
export * from './startBarDrag.js';
export * from './startColResize.js';
export * from './startMilestoneDrag.js';
export * from './startDependencyDrag.js';
export * from './selectTask.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Reverts the last action performed in the project.
 * @returns {void}
 */
export const undo = () => undoManager.undo();

/**
 * Clears the undo history.
 * @returns {void}
 */
export const clearUndo = () => undoManager.clear();
