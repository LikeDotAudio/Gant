import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as columns from '../../columns/index.js';

const { fold } = columns;

export function toggleFold(fullId, e) { 
    if (e) e.stopPropagation(); 
    fold.toggleItem(state.foldedIds, fullId); 
    render(); 
}
