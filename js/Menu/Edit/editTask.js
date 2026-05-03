import { state } from '../../core/state.js';
import { el } from '../../core/elements.js';
import { render } from '../../core/render.js';
import * as pb from '../../progressbar/index.js';

export function editTask(fullId, e) { 
    pb.editBar(fullId, state.projectData, el, render); 
}
