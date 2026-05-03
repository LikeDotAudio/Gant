/**
 * js/Menu/Edit/startMilestoneDrag.js
 * Bridge function to initiate a milestone drag interaction on the timeline.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as timeline from '../../timeline/index.js';
import { undoManager } from '../../Undo/manager.js';

const { milestones } = timeline;

/**
 * Captures the project state and delegates milestone movement to the timeline module.
 * 
 * @param {MouseEvent} mouseEvent - The mouse down event on a milestone diamond.
 * @param {number} milestoneIndex - The index of the milestone in the project data array.
 */
export function startMilestoneDrag(mouseEvent, milestoneIndex) { 
    undoManager.pushState();
    
    milestones.startMilestoneDrag(
        mouseEvent, 
        milestoneIndex, 
        state.projectData, 
        state.zoomLevel, 
        render
    ); 
}
