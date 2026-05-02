/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/progressbar functionality.
 */

import { getContrastColor } from './getContrastColor.js';

export function renderBar(t, l, w, taskColor, isSelected) {
    const textColor = getContrastColor(taskColor);
    
    // Level configuration
    let barH = 14;
    let barTop = 5;
    let textPos = 'right'; // default
    
    if (t.depth === 0) { // Root
        barH = 10; barTop = 7; textPos = 'overlay';
    } else if (t.depth === 1) { // Parent
        barH = 15; barTop = 4; textPos = 'overlay';
    } else if (t.depth === 2) { // Child
        barH = 18; barTop = 3; textPos = 'left';
    } else { // Sibling (Leaf)
        barH = 20; barTop = 2; textPos = 'right';
    }

    let textHtml = '';
    const label = `${t.name} (${t.progress || 0}%)`;
    
    if (textPos === 'overlay') {
        textHtml = `<div class="bar-content overlay-text" style="color:${textColor}">${label}</div>`;
    } else if (textPos === 'left') {
        textHtml = `<div class="bar-label-left" style="left:${l}px; transform:translate(-100%, -50%);">${label}</div>`;
    } else { // right
        textHtml = `<div class="bar-label-right" style="left:${l + w}px;">${label}</div>`;
    }

    return `
        <div class="task-bars-cell" onmouseenter="this.parentElement.draggable=false" onmouseleave="this.parentElement.draggable=true">
            ${textPos === 'left' ? textHtml : ''}
            <div class="bar ${isSelected ? 'selected-bar' : ''}" 
                 style="left:${l}px; width:${w}px; height:${barH}px; top:${barTop}px; background-color:${taskColor}; color:${textColor}; position:absolute;" 
                 data-action="barInteract" data-id="${t.fullId}">
                <div class="progress-overlay" style="width:${t.progress || 0}%"></div>
                ${textPos === 'overlay' ? textHtml : ''}
                <!-- Handles last to be on top -->
                <div class="bar-handle bar-handle-left" data-action="resize-left" title="Drag to change start date"></div>
                <div class="bar-handle bar-handle-right" data-action="resize-right" title="Drag to change duration"></div>
            </div>
            ${textPos === 'right' ? textHtml : ''}
        </div>
    `;
}
