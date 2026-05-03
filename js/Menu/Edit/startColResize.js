/**
 * js/Menu/Edit/startColResize.js
 * Handles the interactive resizing of spreadsheet-style columns in the Gantt chart.
 */

import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { updateNav } from '../../core/clientWorker.js';

/**
 * Initiates a column resize interaction.
 * Uses global mouse events to track the delta and update CSS variables.
 * 
 * @param {MouseEvent} mouseDownEvent - The mouse event that triggered the resize.
 * @param {string} columnIdentifier - The internal name of the column (e.g., 'name', 'start').
 */
export function startColResize(mouseDownEvent, columnIdentifier) {
    mouseDownEvent.preventDefault(); 
    mouseDownEvent.stopPropagation(); 
    
    state.isResizingCol = true;
    
    const initialMouseX = mouseDownEvent.clientX; 
    const cssVariableName = `--${columnIdentifier}-w`;
    
    // Read the current width from the computed style of the document
    const initialWidthPx = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(cssVariableName)
    ) || 0;
    
    /**
     * Updates the column width based on mouse movement.
     * @param {MouseEvent} mouseMoveEvent 
     */
    const onMouseMove = (mouseMoveEvent) => {
        const mouseDeltaX = mouseMoveEvent.clientX - initialMouseX;
        const newWidthPx = Math.max(10, initialWidthPx + mouseDeltaX);
        
        document.documentElement.style.setProperty(cssVariableName, `${newWidthPx}px`);
        
        // Shallow render to update column alignment
        render(false); 
        
        // Update the navigator if it's active
        if (updateNav) {
            updateNav(
                state.flatTasks, 
                state.projectMin, 
                state.projectMax, 
                state.zoomLevel, 
                state.projectData.milestones
            );
        }
    };
    
    /**
     * Cleans up event listeners when the resize operation ends.
     */
    const onMouseUp = () => { 
        window.removeEventListener('mousemove', onMouseMove); 
        window.removeEventListener('mouseup', onMouseUp); 
        document.body.style.cursor = 'default'; 
        state.isResizingCol = false;
    };
    
    window.addEventListener('mousemove', onMouseMove, { passive: true }); 
    window.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
}
