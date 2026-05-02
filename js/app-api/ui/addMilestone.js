import { state } from '../../core/state.js';
import { el } from '../../core/elements.js';
import { render } from '../../core/render.js';
import * as timeline from '../../timeline/index.js';

const { milestones } = timeline;

export function addMilestone(e, minDateStr) { 
    milestones.addMilestone(e, minDateStr, state.projectData, state.zoomLevel, el, render); 
}
