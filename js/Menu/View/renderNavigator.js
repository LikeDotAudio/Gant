/**
 * js/Menu/View/renderNavigator.js
 * Forces a refresh of the mini-map navigator view.
 */

import { state } from '../../core/state.js';
import { updateNav as updateNavigatorDisplay } from '../../core/clientWorker.js';

/**
 * Requests the worker to re-render the navigator canvas based on the current state.
 */
export function renderNavigator() { 
    if (updateNavigatorDisplay) {
        updateNavigatorDisplay(
            state.flatTasks, 
            state.projectMin, 
            state.projectMax, 
            state.zoomLevel, 
            state.projectData.milestones
        );
    }
}
