import { renderAxis } from './renderAxis.js';
import { getStickyWidthPx } from './getStickyWidthPx.js';
import { renderWBSColumns } from './renderWBSColumns.js';
import { getTriangle } from '../columns/index.js';
import { renderBar } from '../progressbar/index.js';
let lastZoomLevel = null;
export function renderGantt(projectData, zoomLevel, foldedIds, selectedTaskFullId, chartEl, flat, forceFull = true, projectMinStr = null, projectMaxStr = null) {
    if (!projectData.roots || !flat) return;
    const container = document.getElementById('gantt-container');
    if (!container) return;
    const minDate = projectMinStr ? new Date(projectMinStr + 'T00:00:00') : new Date();
    const maxDate = projectMaxStr ? new Date(projectMaxStr + 'T00:00:00') : new Date();
    const totalDays = Math.ceil((maxDate - minDate) / 86400000);
    if (lastZoomLevel !== zoomLevel) {
        document.documentElement.style.setProperty('--chart-col-width', `${zoomLevel}px`);
        lastZoomLevel = zoomLevel;
    }
    const stickyWidth = `calc(var(--root-w) + var(--parent-w) + var(--child-w) + var(--sibling-w) + var(--color-w) + var(--dep-w) + var(--name-w) + var(--prog-w) + var(--start-w) + var(--end-w) + var(--dur-w))`;
    const rowHeight = 24;
    const headerHeight = 108; // Adjusted for Seasons + Quarters + Months + Weeks + Days
    const totalHeight = headerHeight + (flat.length * rowHeight);
    const viewportHeight = container.clientHeight || 800;
    const viewportWidth = container.clientWidth || 1000;
    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;
    const startIdx = Math.max(0, Math.floor((scrollTop - headerHeight) / rowHeight));
    const endIdx = Math.min(flat.length, Math.ceil((scrollTop + viewportHeight - headerHeight) / rowHeight) + 1);
    const stickyWidthPx = getStickyWidthPx();
    const visibleStartDay = Math.max(0, Math.floor((scrollLeft - stickyWidthPx) / zoomLevel));
    const visibleEndDay = Math.min(totalDays, Math.ceil((scrollLeft + viewportWidth) / zoomLevel));
    if (!chartEl.querySelector('.gantt-rows-container')) {
        chartEl.innerHTML = `
            <div class="gantt-header-wrapper" style="position: sticky; top: 0; z-index: 200; background: var(--header-bg);"></div>
            <div class="gantt-rows-container" style="position: relative;"></div>
            <div class="gantt-decorations-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 150;"></div>
            <div class="hover-line" style="position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px dotted #888; z-index: 151; pointer-events: none; display: none;"></div>
        `;
        forceFull = true;
    }
    const headerWrapper = chartEl.querySelector('.gantt-header-wrapper');
    const rowsContainer = chartEl.querySelector('.gantt-rows-container');
    const decorContainer = chartEl.querySelector('.gantt-decorations-container');
    chartEl.style.height = `${totalHeight}px`;
    chartEl.style.width = `calc(${stickyWidth} + ${totalDays * zoomLevel}px)`;
    const lastScrollLeft = headerWrapper.dataset.lastScrollLeft || "-1";
    const needsHeaderUpdate = forceFull || Math.abs(parseFloat(lastScrollLeft) - scrollLeft) > 1;
    if (needsHeaderUpdate) {
        headerWrapper.dataset.lastScrollLeft = scrollLeft;
        let h = `<div class="gantt-header">
            <div class="h-cell c-root">Root<div class="col-resizer" data-col="root"></div></div>
            <div class="h-cell c-parent">Parent</div>
            <div class="h-cell c-child">Child</div>
            <div class="h-cell c-sibling">Siblings</div>
            <div class="h-cell c-color">Color<div class="col-resizer" data-col="color"></div></div>
            <div class="h-cell c-dep">Dependency<div class="col-resizer" data-col="dep"></div></div>
            <div class="h-cell c-name">Task Name<div class="col-resizer" data-col="name"></div></div>
            <div class="h-cell c-prog">Progress<div class="col-resizer" data-col="prog"></div></div>
            <div class="h-cell c-start">Start<div class="col-resizer" data-col="start"></div></div>
            <div class="h-cell c-end">End<div class="col-resizer" data-col="end"></div></div>
            <div class="h-cell c-dur">Days<div class="col-resizer" data-col="dur"></div></div>
            <div class="gantt-timeline" style="position:relative; flex-grow:1; overflow:hidden;" data-action="addMilestone" data-min-date="${minDate.toISOString()}" title="Double click to add Milestone">
                ${renderAxis(minDate, maxDate, zoomLevel, scrollLeft, viewportWidth, stickyWidthPx)}
            </div>
        </div>`;
        headerWrapper.innerHTML = h;
        if (forceFull) {
            let dH = "";
            const today = new Date();
            const todayX = Math.floor((today - minDate) / 86400000) * zoomLevel;
            if (todayX >= 0 && todayX <= totalDays * zoomLevel) {
                dH += `<div class="today-line" style="left: calc(${stickyWidth} + ${todayX}px); height: ${totalHeight}px"></div>`;
            }
            if (projectData.milestones) {
                projectData.milestones.forEach((m, idx) => {
                    const mDate = new Date(m.date + 'T00:00:00');
                    const mX = Math.floor((mDate - minDate) / 86400000) * zoomLevel;
                    if (mX >= 0 && mX <= totalDays * zoomLevel) {
                        dH += `<div class="milestone-container" style="left: calc(${stickyWidth} + ${mX}px); height: ${totalHeight}px">
                                <div class="milestone-line"></div>
                                <div class="milestone-diamond" 
                                     data-action="milestoneDrag" data-index="${idx}"
                                     title="${m.name} - ${m.date}"></div>
                                <div class="milestone-name">${m.name}</div>
                              </div>`;
                    }
                });
            }
            decorContainer.innerHTML = dH;
        }
    }
    let rowH = "";
    for (let i = startIdx; i < endIdx; i++) {
        const t = flat[i];
        const s = new Date(t.calculatedStart); 
        const l = Math.floor((s - minDate) / 86400000) * zoomLevel;
        const w = Math.max((t.duration || 1) * zoomLevel, 5);
        const triangle = getTriangle(t, t.isFolded);
        const isSelected = selectedTaskFullId === t.fullId;
        const depthClass = `row-depth-${t.depth}`;
        const taskColor = t.resolvedColor || '#f4902c';
        rowH += `<div class="gantt-row ${isSelected?'selected-row':''} ${depthClass}" draggable="true" 
                data-id="${t.fullId}" 
                style="position: absolute; top: ${headerHeight + i * rowHeight}px; left: 0; right: 0;">
            ${renderWBSColumns(t, triangle)}
            ${renderBar(t, l, w, taskColor, isSelected)}
        </div>`;
    }
    rowsContainer.innerHTML = rowH;
}
