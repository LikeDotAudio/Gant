import { state } from '../../core/state.js';
import { el } from '../../core/elements.js';
import { render } from '../../core/render.js';
import * as pb from '../../progressbar/index.js';

export function editTask(fullId, e) { 
    if (!fullId && state.selectedTaskFullIds.size > 0) {
        fullId = Array.from(state.selectedTaskFullIds)[0];
    }
    if (fullId) {
        pb.editBar(fullId, state.projectData, el, render); 
    }
}
