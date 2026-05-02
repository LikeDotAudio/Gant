import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as timeline from '../../timeline/index.js';

const { milestones } = timeline;

export function startMilestoneDrag(e, index) { 
    milestones.startMilestoneDrag(e, index, state.projectData, state.zoomLevel, render); 
}
