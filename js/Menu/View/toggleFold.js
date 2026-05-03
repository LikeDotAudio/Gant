import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as columns from '../../columns/index.js';
import { undoManager } from '../../Undo/manager.js';

const { fold } = columns;

export function toggleFold(fullId, e) { 
    if (e) e.stopPropagation(); 
    undoManager.pushState();
    fold.toggleItem(state.foldedIds, fullId); 
    render(); 
}
