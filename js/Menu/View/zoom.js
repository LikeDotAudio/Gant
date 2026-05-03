/**
 * js/Menu/View/zoom.js
 * Handles incremental zooming of the Gantt timeline.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { updateNav as updateNavigatorDisplay } from '../../core/clientWorker.js';

const MINIMUM_ZOOM_PX_PER_DAY = 10;
const MAXIMUM_ZOOM_PX_PER_DAY = 200;

/**
 * Adjusts the horizontal zoom level by a specific delta.
 * 
 * @param {number} zoomDelta - The amount to add/subtract from the current zoom level.
 */
export function zoom(zoomDelta) { 
    const currentZoom = state.zoomLevel;
    const requestedZoom = currentZoom + zoomDelta;

    // Clamp zoom within established limits
    state.zoomLevel = Math.max(
        MINIMUM_ZOOM_PX_PER_DAY, 
        Math.min(MAXIMUM_ZOOM_PX_PER_DAY, requestedZoom)
    ); 
    
    render(); 
    
    // Synchronize navigator view
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
