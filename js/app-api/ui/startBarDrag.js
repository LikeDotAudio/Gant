import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import * as pb from '../../progressbar/index.js';

export function startBarDrag(e, fullId, mode) { 
    pb.startBarDrag(e, fullId, mode, state, render); 
}
