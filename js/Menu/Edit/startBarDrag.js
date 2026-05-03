import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as pb from '../../progressbar/index.js';
import { undoManager } from '../../Undo/manager.js';

export function startBarDrag(e, fullId, mode) { 
    undoManager.pushState();
    pb.startBarDrag(e, fullId, mode, state, render); 
}
