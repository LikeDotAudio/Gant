import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as columns from '../../columns/index.js';

const { fold } = columns;

export function foldToLevel(depth) { 
    fold.foldToLevel(state.projectData.roots, state.foldedIds, depth); 
    render(); 
}
