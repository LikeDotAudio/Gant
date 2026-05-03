/**
 * js/progressbar/render.js
 * Handles the rendering of task bars and their associated labels within the Gantt chart.
 */

import { getContrastColor } from './getContrastColor.js';
import { LAYOUT, DEPTH } from '../core/constants.js';

/**
 * Generates the HTML string for a single task bar.
 * 
 * @param {Object} task - The task object containing data (name, progress, depth, etc.)
 * @param {number} leftPositionPx - The horizontal offset from the start of the timeline in pixels.
 * @param {number} widthPx - The width of the task bar in pixels.
 * @param {string} taskColorHex - The background color of the bar.
 * @param {boolean} isSelected - Whether the task is currently selected in the UI.
 * @returns {string} HTML string representing the task bar.
 */
export function renderBar(task, leftPositionPx, widthPx, taskColorHex, isSelected) {
    const textContrastColor = getContrastColor(taskColorHex);
    
    // Level-based configuration for bar dimensions and label positioning
    let barHeightPx = LAYOUT.BAR_HEIGHTS.SIBLING;
    let barTopOffsetPx = LAYOUT.BAR_TOP_OFFSETS.SIBLING;
    let labelPositionMode = 'right'; // Options: 'right', 'left', 'overlay'

    if (task.depth === DEPTH.ROOT) {
        barHeightPx = LAYOUT.BAR_HEIGHTS.ROOT; 
        barTopOffsetPx = LAYOUT.BAR_TOP_OFFSETS.ROOT; 
        labelPositionMode = 'overlay';
    } else if (task.depth === DEPTH.PARENT) {
        barHeightPx = LAYOUT.BAR_HEIGHTS.PARENT; 
        barTopOffsetPx = LAYOUT.BAR_TOP_OFFSETS.PARENT; 
        labelPositionMode = 'overlay';
    } else if (task.depth === DEPTH.CHILD) {
        barHeightPx = LAYOUT.BAR_HEIGHTS.CHILD; 
        barTopOffsetPx = LAYOUT.BAR_TOP_OFFSETS.CHILD; 
        labelPositionMode = 'left';
    }

    let labelHtml = '';
    const displayLabel = `${task.name} (${task.progress || 0}%)`;

    if (labelPositionMode === 'overlay') {
        labelHtml = `<div class="bar-content overlay-text" style="color:${textContrastColor}">${displayLabel}</div>`;
    } else if (labelPositionMode === 'left') {
        labelHtml = `<div class="bar-label-left" style="left:${leftPositionPx}px; transform:translate(-100%, -50%);">${displayLabel}</div>`;
    } else { // 'right'
        labelHtml = `<div class="bar-label-right" style="left:${leftPositionPx + widthPx}px;">${displayLabel}</div>`;
    }

    return `
        <div class="task-bars-cell" onmouseenter="this.parentElement.draggable=false" onmouseleave="this.parentElement.draggable=true">
            ${labelPositionMode === 'left' ? labelHtml : ''}
            <div class="bar ${isSelected ? 'selected-bar' : ''}" 
                 style="left:${leftPositionPx}px; width:${widthPx}px; height:${barHeightPx}px; top:${barTopOffsetPx}px; background-color:${taskColorHex}; color:${textContrastColor}; position:absolute;" 
                 data-action="barInteract" data-id="${task.fullId}">
                <div class="progress-overlay" style="width:${task.progress || 0}%"></div>
                ${labelPositionMode === 'overlay' ? labelHtml : ''}
                
                <!-- Interaction Handles -->
                <div class="bar-handle bar-handle-left" data-action="resize-left" title="Drag to change start date"></div>
                <div class="bar-handle bar-handle-right" data-action="resize-right" title="Drag to change duration"></div>
                
                <div class="dependency-handle ${task.dependency ? 'has-dependency' : ''}" 
                     data-action="dependency-start" 
                     title="Drag to create dependency connection" 
                     style="position:absolute; right:2px; top:50%; width:10px; height:10px; background:#ff4a4a; border:1px solid #fff; border-radius:50%; transform:translateY(-50%); cursor:crosshair; z-index:30;">
                </div>
            </div>
            ${labelPositionMode === 'right' ? labelHtml : ''}
        </div>
    `;
}
