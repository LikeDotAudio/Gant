import { state } from '../../core/state.js';
import { el } from '../../core/elements.js';
import { render } from '../../core/render.js';
import * as timeline from '../../timeline/index.js';
import { undoManager } from '../../Undo/manager.js';

const { milestones } = timeline;

export function addMilestone(e, minDateStr) { 
    undoManager.pushState();
    milestones.addMilestone(e, minDateStr, state.projectData, state.zoomLevel, el, render); 
}
