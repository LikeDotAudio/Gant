/**
 * js/Menu/Edit/addMilestone.js
 * Provides functionality to add a new milestone to the project timeline.
 */

import { state } from '../../core/state.js';
import { el as elements } from '../../core/elements.js';
import { render } from '../../core/render.js';
import * as timeline from '../../timeline/index.js';
import { undoManager } from '../../Undo/manager.js';

const { milestones } = timeline;

/**
 * Adds a new milestone to the project at the specified event coordinates.
 * 
 * @param {MouseEvent|KeyboardEvent} event - The event that triggered the milestone addition.
 * @param {string} minDateStr - The minimum date string allowed for the milestone.
 * @returns {void}
 */
export function addMilestone(event, minDateStr) { 
    undoManager.pushState();
    milestones.addMilestone(event, minDateStr, state.projectData, state.zoomLevel, elements, render); 
}
