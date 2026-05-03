import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as timeline from '../../timeline/index.js';
import { undoManager } from '../../Undo/manager.js';

const { milestones } = timeline;

export function startMilestoneDrag(e, index) { 
    undoManager.pushState();
    milestones.startMilestoneDrag(e, index, state.projectData, state.zoomLevel, render); 
}
