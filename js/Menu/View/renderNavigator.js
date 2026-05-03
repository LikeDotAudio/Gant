import { state } from '../../core/state.js';
import { updateNav } from '../../core/clientWorker.js';

export function renderNavigator() { 
    if (updateNav) updateNav(state.flatTasks, state.projectMin, state.projectMax, state.zoomLevel); 
}
