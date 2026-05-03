/**
 * js/progressbar/startBarDrag.js
 * Primary controller for interactive task bar manipulations (moving and resizing).
 * Handles the state transitions from mouse-down through drag to mouse-up.
 */

import * as ganttOperations from '../Rows/index.js';
import { handleResizeRight } from './handleResizeRight.js';
import { handleResizeLeft } from './handleResizeLeft.js';
import { applyResizeRight } from './applyResizeRight.js';
import { applyResizeLeft } from './applyResizeLeft.js';
import { handleMove } from './handleMove.js';
import { applyMove } from './applyMove.js';
import { LAYOUT } from '../core/constants.js';

/**
 * Initiates a bar drag operation. Sets up global mouse listeners and manages the lifecycle of the drag.
 * 
 * @param {MouseEvent} mouseDownEvent - The native mouse event that triggered the drag.
 * @param {string} taskFullId - The dot-notated full ID of the task being manipulated.
 * @param {string} dragInteractionMode - The type of interaction ('move', 'resize-left', 'resize-right').
 * @param {Object} applicationState - The global app state.
 * @param {Function} renderCallback - Function to trigger a view refresh.
 */
export function startBarDrag(
    mouseDownEvent, 
    taskFullId, 
    dragInteractionMode, 
    applicationState, 
    renderCallback
) {
    const { projectData, zoomLevel, foldedIds } = applicationState;
    
    const dragInitialMouseX = mouseDownEvent.clientX;
    const dragInitialMouseY = mouseDownEvent.clientY;

    const targetTaskObject = ganttOperations.findTask(projectData.roots, taskFullId);
    const barHtmlElement = mouseDownEvent.target.closest('.bar');
    
    if (!barHtmlElement) {
        return;
    }

    // Capture initial visual properties for delta calculations
    const initialBarLeftPx = parseFloat(barHtmlElement.style.left);
    const initialBarWidthPx = parseFloat(barHtmlElement.style.width);
    const standardRowHeightPx = LAYOUT.DEFAULT_ROW_HEIGHT_PX; 

    // Generate a fresh flat list to ensure we have current calculated dates
    const currentFlatTasks = ganttOperations.flattenTasks(projectData.roots, 0, "", { 
        baseDate: projectData.baseDate, 
        foldedIds: foldedIds 
    });
    
    const targetFlatTaskEntry = currentFlatTasks.find(task => task.fullId === taskFullId);
    if (!targetFlatTaskEntry) {
        return;
    }

    const initialTaskDuration = targetFlatTaskEntry.duration || 1;
    const initialTaskStartDate = new Date(targetFlatTaskEntry.calculatedStart + 'T00:00:00');

    /**
     * Handles the continuous movement of the mouse during the drag.
     * @param {MouseEvent} mouseMoveEvent 
     */
    const onMouseMove = (mouseMoveEvent) => {
        switch (dragInteractionMode) {
            case 'resize-right':
                handleResizeRight(mouseMoveEvent, barHtmlElement, initialBarWidthPx, dragInitialMouseX, zoomLevel);
                break;
            case 'resize-left':
                handleResizeLeft(mouseMoveEvent, barHtmlElement, initialBarLeftPx, initialBarWidthPx, dragInitialMouseX, zoomLevel);
                break;
            case 'move':
                handleMove(mouseMoveEvent, barHtmlElement, initialBarLeftPx, dragInitialMouseX, dragInitialMouseY);
                break;
        }
    };

    /**
     * Finalizes the manipulation when the mouse is released.
     * @param {MouseEvent} mouseUpEvent 
     */
    const onMouseUp = (mouseUpEvent) => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        switch (dragInteractionMode) {
            case 'resize-right':
                applyResizeRight(mouseUpEvent, targetTaskObject, initialTaskDuration, dragInitialMouseX, zoomLevel);
                break;
            case 'resize-left':
                applyResizeLeft(mouseUpEvent, targetTaskObject, initialTaskDuration, initialTaskStartDate, dragInitialMouseX, zoomLevel);
                break;
            case 'move':
                applyMove(
                    mouseUpEvent, 
                    targetTaskObject, 
                    initialTaskStartDate, 
                    dragInitialMouseX, 
                    dragInitialMouseY, 
                    zoomLevel, 
                    standardRowHeightPx, 
                    projectData, 
                    taskFullId, 
                    currentFlatTasks
                );
                break;
        }

        renderCallback();

        // Notify the application to persist changes
        if (window.app && typeof window.app.updateTask === 'function') {
            window.app.updateTask(taskFullId, 'duration', targetTaskObject.duration);
            
            if (dragInteractionMode === 'resize-left') {
                window.app.updateTask(taskFullId, 'start', targetTaskObject.start);
            }
        }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
}
