/**
 * js/utils/ui/barEdit.js
 * Manages the task editor overlay, allowing users to modify task names, progress, IDs, and colors.
 */

import * as ganttOperations from '../../Rows/index.js';

/**
 * Opens and populates the task edit overlay.
 * 
 * @param {string} taskFullId - The dot-notated full ID of the task to edit.
 * @param {Object} projectData - The current project hierarchical data.
 * @param {Object} uiElements - Map of global DOM elements.
 * @param {Function} renderViewCallback - Function to refresh the Gantt chart.
 */
export function editBar(taskFullId, projectData, uiElements, renderViewCallback) {
    const targetTask = ganttOperations.findTask(projectData.roots, taskFullId);
    if (!targetTask) {
        return;
    }

    // Find the flat task representation to access calculated dates (cascading dates)
    const { flat: flattenedTasks } = ganttOperations.getFlattenedProject(
        projectData.roots, 
        { baseDate: projectData.baseDate }
    );
    const targetFlatTaskEntry = flattenedTasks.find(task => task.fullId === taskFullId);

    // Show and focus the overlay
    uiElements.overlay.style.display = 'flex';
    uiElements.overlayTitle.innerText = `Edit: ${targetTask.name}`;
    uiElements.overlayInput.value = targetTask.name;
    uiElements.overlayInput.focus();
    uiElements.overlayInput.select();
    uiElements.overlayProgress.value = targetTask.progress || 0;
    
    // Set the task ID field (WBS part)
    uiElements.overlayId.value = ganttOperations.getTaskId(targetTask);
    
    // Set the dependency field
    if (uiElements.overlayDep) {
        uiElements.overlayDep.value = targetTask.dependency || '';
    }

    const progressValueLabel = document.getElementById('progress-val');
    if (progressValueLabel) {
        progressValueLabel.innerText = `${targetTask.progress || 0}%`;
    }

    const startDateInputElement = document.getElementById('overlay-start');
    const endDateInputElement = document.getElementById('overlay-end');
    
    if (startDateInputElement && endDateInputElement && targetFlatTaskEntry) {
        startDateInputElement.value = targetFlatTaskEntry.calculatedStart ? targetFlatTaskEntry.calculatedStart.split('T')[0] : '';
        endDateInputElement.value = targetFlatTaskEntry.calculatedEnd ? targetFlatTaskEntry.calculatedEnd.split('T')[0] : '';
    }

    const colorPaletteHexCodes = [
        'none', '#000000', '#5d4037', '#ff0000', '#ff9800', '#ffff00', 
        '#00ff00', '#2196f3', '#9c27b0', '#9e9e9e', '#ffffff'
    ];
    
    const colorPaletteGridElement = document.getElementById('palette-grid');
    colorPaletteGridElement.innerHTML = '';
    
    let currentlySelectedColor = targetTask.color || "none";
    
    colorPaletteHexCodes.forEach(colorHex => {
        const colorSwatchElement = document.createElement('div');
        colorSwatchElement.className = 'palette-color';
        
        if (colorHex === 'none') {
            colorSwatchElement.classList.add('res-none');
            colorSwatchElement.title = "No Color";
            colorSwatchElement.style.display = 'flex';
            colorSwatchElement.style.alignItems = 'center';
            colorSwatchElement.style.justifyContent = 'center';
            colorSwatchElement.innerHTML = '<span style="color: #888; transform: rotate(45deg); font-weight: bold;">|</span>';
        } else {
            colorSwatchElement.style.backgroundColor = colorHex;
        }
        
        if (colorHex.toLowerCase() === currentlySelectedColor.toLowerCase()) {
            colorSwatchElement.classList.add('active');
        }
        
        colorSwatchElement.onclick = () => {
            currentlySelectedColor = colorHex;
            colorPaletteGridElement.querySelectorAll('.palette-color').forEach(swatch => swatch.classList.remove('active'));
            colorSwatchElement.classList.add('active');
        };
        
        colorPaletteGridElement.appendChild(colorSwatchElement);
    });

    /**
     * Closes the overlay and cleans up listeners.
     */
    const cleanupAndClose = () => {
        uiElements.overlay.style.display = 'none';
        window.removeEventListener('keydown', handleKeyDown);
    };

    /**
     * Local keyboard handler for Enter/Escape within the overlay context.
     * @param {KeyboardEvent} keyboardEvent 
     */
    const handleKeyDown = (keyboardEvent) => {
        if (keyboardEvent.key === 'Enter') {
            keyboardEvent.preventDefault();
            uiElements.overlayOk.click();
        } else if (keyboardEvent.key === 'Escape') {
            uiElements.overlayCancel.click();
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    /**
     * Finalizes the edit by updating the task object and refreshing the view.
     */
    uiElements.overlayOk.onclick = () => {
        targetTask.name = uiElements.overlayInput.value;
        targetTask.progress = parseInt(uiElements.overlayProgress.value);
        targetTask.color = currentlySelectedColor;
        
        // Update task ID based on the task depth
        const taskHierarchyDepth = targetFlatTaskEntry ? targetFlatTaskEntry.depth : 0;
        ganttOperations.setTaskId(targetTask, uiElements.overlayId.value, taskHierarchyDepth);

        // Update dependency
        if (uiElements.overlayDep) {
            targetTask.dependency = uiElements.overlayDep.value;
        }

        // Handle date overrides
        if (startDateInputElement && endDateInputElement) {
            targetTask.start = startDateInputElement.value;
            const startDate = new Date(startDateInputElement.value + 'T00:00:00');
            const endDate = new Date(endDateInputElement.value + 'T00:00:00');
            
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const dayDifference = Math.ceil((endDate - startDate) / 86400000);
                targetTask.duration = Math.max(1, dayDifference);
            }
        }
        
        renderViewCallback();
        cleanupAndClose();

        // Notify app to persist state via dummy change if needed
        if (window.app && typeof window.app.updateTask === 'function') {
            window.app.updateTask(taskFullId, 'dummy', null); 
        }
    };

    uiElements.overlayCancel.onclick = () => {
        cleanupAndClose();
    };
}
