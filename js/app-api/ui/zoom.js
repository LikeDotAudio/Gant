import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { updateNav } from '../../core/worker-client.js';

export function zoom(delta) { 
    state.zoomLevel = Math.max(10, Math.min(200, state.zoomLevel + delta)); 
    render(); 
    if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel); 
}
