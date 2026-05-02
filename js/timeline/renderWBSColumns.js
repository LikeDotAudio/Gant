/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/timeline functionality.
 */

import { getResistorClass } from './getResistorClass.js';
import { formatDate } from './formatDate.js';

export function renderWBSColumns(t, triangle) {
    return `
        <div class="d-cell c-root ${getResistorClass(t.wbs_root)}">${t.wbs_root}</div>
        <div class="d-cell c-parent ${getResistorClass(t.wbs_parent)}">${t.wbs_parent}</div>
        <div class="d-cell c-child ${getResistorClass(t.wbs_child)}">${t.wbs_child}</div>
        <div class="d-cell c-sibling ${getResistorClass(t.wbs_sibling)}" title="${t.wbs_sibling}">${t.wbs_sibling}</div>
        <div class="d-cell c-color" data-action="editTask" data-id="${t.fullId}" style="cursor:pointer" title="Click to edit task">
            <div style="width:20px; height:12px; background:${t.color || 'transparent'}; border:1px solid #444; border-radius:2px; pointer-events:none;"></div>
        </div>
        <div class="d-cell c-dep" title="Double click to edit" data-action="selectTask" data-id="${t.fullId}">${t.dependency || ''}</div>
        <div class="d-cell c-name" data-action="selectTask" data-id="${t.fullId}">
            ${'<div class="indent"></div>'.repeat(t.depth)}
            ${triangle}
            <span class="task-name-label" 
                   style="font-weight:${t.wbs_sibling==='-'?'bold':'normal'}; flex-grow:1; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${t.name}
            </span>
        </div>
        <div class="d-cell c-prog" data-action="editTask" data-id="${t.fullId}" style="cursor:pointer" title="Click to edit progress and dates">
            ${t.progress || 0}%
        </div>
        <div class="d-cell c-start" data-action="selectTask" data-id="${t.fullId}">${formatDate(t.calculatedStart)}</div>
        <div class="d-cell c-end" data-action="selectTask" data-id="${t.fullId}">${formatDate(t.calculatedEnd)}</div>
        <div class="d-cell c-dur" data-action="selectTask" data-id="${t.fullId}">${Number(t.duration || 0).toFixed(2)}</div>
    `;
}
