/**
 * js/Menu/View/zoomFit.js
 * Automatically adjusts the zoom level to fit the entire project timeline within the viewport.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { updateNav as updateNavigatorDisplay } from '../../core/clientWorker.js';
import { getStickyWidthPx } from '../../utils/layout.js';
import { TIME } from '../../core/constants.js';

/**
 * Calculates and applies an optimal zoom level to show all project tasks without scrolling.
 */
export function zoomFit() {
    const scrollingContainerElement = document.getElementById('gantt-container');
    
    if (!scrollingContainerElement || !state.projectMin || !state.projectMax) {
        return;
    }

    const projectStartDate = new Date(state.projectMin + 'T00:00:00');
    const projectEndDate = new Date(state.projectMax + 'T00:00:00');
    const totalProjectDurationDays = Math.ceil((projectEndDate - projectStartDate) / TIME.MILLISECONDS_PER_DAY);

    if (totalProjectDurationDays <= 0) {
        return;
    }

    const availableTimelineWidthPx = scrollingContainerElement.clientWidth - getStickyWidthPx();
    
    // Ensure we have a reasonable width to work with
    if (availableTimelineWidthPx > 50) {
        const calculatedOptimalZoom = Math.floor(availableTimelineWidthPx / totalProjectDurationDays);
        
        // Clamp the calculated zoom within application limits
        state.zoomLevel = Math.max(10, Math.min(200, calculatedOptimalZoom));
        
        render(); 
        
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
}
