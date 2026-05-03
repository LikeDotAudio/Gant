/**
 * js/timeline/renderGantt.js
 * The primary rendering engine for the Gantt chart view. 
 * Manages the virtualization of rows, rendering of the timeline header, and drawing task bars/dependencies.
 */

import { renderAxis } from './renderAxis.js';
import { getStickyWidthPx } from './getStickyWidthPx.js';
import { renderWBSColumns } from './renderWBSColumns.js';
import { getTriangle } from '../columns/index.js';
import { renderBar, renderDependencyLines } from '../progressbar/index.js';
import { TIME, Z_INDEX, LAYOUT, COLORS } from '../core/constants.js';

let memoizedLastZoomLevel = null;

/**
 * Renders the entire Gantt chart including headers, rows, and decorations.
 * 
 * @param {Object} projectData - The main project data structure.
 * @param {number} zoomLevel - The current horizontal zoom scale (pixels per day).
 * @param {Set<string>} foldedIds - Set of full IDs of tasks that are currently folded.
 * @param {Set<string>} selectedTaskFullIds - Set of full IDs of tasks currently selected.
 * @param {HTMLElement} chartContainerEl - The DOM element where the chart is rendered.
 * @param {Array<Object>} flattenedTasks - The cached flat list of tasks for the current view.
 * @param {boolean} [shouldForceFullRender=true] - If true, ignores optimization checks and forces a full redraw.
 * @param {string|null} [projectStartDateStr=null] - ISO date string for the project start.
 * @param {string|null} [projectEndDateStr=null] - ISO date string for the project end.
 */
export function renderGantt(
    projectData, 
    zoomLevel, 
    foldedIds, 
    selectedTaskFullIds, 
    chartContainerEl, 
    flattenedTasks, 
    shouldForceFullRender = true, 
    projectStartDateStr = null, 
    projectEndDateStr = null
) {
    if (!projectData.roots || !flattenedTasks) return;

    const scrollingContainer = document.getElementById('gantt-container');
    if (!scrollingContainer) return;

    const timelineMinDate = projectStartDateStr ? new Date(projectStartDateStr + 'T00:00:00') : new Date();
    const timelineMaxDate = projectEndDateStr ? new Date(projectEndDateStr + 'T00:00:00') : new Date();
    const totalTimelineDays = Math.ceil((timelineMaxDate - timelineMinDate) / TIME.MILLISECONDS_PER_DAY);

    // Update CSS variables if zoom level changed
    if (memoizedLastZoomLevel !== zoomLevel) {
        document.documentElement.style.setProperty('--chart-col-width', `${zoomLevel}px`);
        memoizedLastZoomLevel = zoomLevel;
    }

    const stickyColumnWidthStyle = `calc(var(--root-w) + var(--parent-w) + var(--child-w) + var(--sibling-w) + var(--color-w) + var(--dep-w) + var(--name-w) + var(--prog-w) + var(--start-w) + var(--end-w) + var(--dur-w))`;
    const viewportHeightPx = scrollingContainer.clientHeight || 800;
    const viewportWidthPx = scrollingContainer.clientWidth || 1000;
    const currentScrollTopPx = scrollingContainer.scrollTop;
    const currentScrollLeftPx = scrollingContainer.scrollLeft;

    // Row Virtualization: Calculate visible range
    const visibleStartIdx = Math.max(0, Math.floor((currentScrollTopPx - LAYOUT.HEADER_HEIGHT_PX) / LAYOUT.DEFAULT_ROW_HEIGHT_PX));
    const visibleEndIdx = Math.min(flattenedTasks.length, Math.ceil((currentScrollTopPx + viewportHeightPx - LAYOUT.HEADER_HEIGHT_PX) / LAYOUT.DEFAULT_ROW_HEIGHT_PX) + 1);

    const stickyWidthPx = getStickyWidthPx();
    
    // Scaffolding the basic chart structure if not present
    if (!chartContainerEl.querySelector('.gantt-rows-container')) {
        initializeChartScaffold(chartContainerEl);
        shouldForceFullRender = true;
    }

    const headerWrapper = chartContainerEl.querySelector('.gantt-header-wrapper');
    const rowsContainer = chartContainerEl.querySelector('.gantt-rows-container');
    const decorationsContainer = chartContainerEl.querySelector('.gantt-decorations-container');
    const dependencySvg = chartContainerEl.querySelector('#dependency-svg');

    const totalChartHeightPx = LAYOUT.HEADER_HEIGHT_PX + (flattenedTasks.length * LAYOUT.DEFAULT_ROW_HEIGHT_PX);
    chartContainerEl.style.height = `${totalChartHeightPx}px`;
    chartContainerEl.style.width = `calc(${stickyColumnWidthStyle} + ${totalTimelineDays * zoomLevel}px)`;

    // Optimization: Only redraw header if scroll changed significantly
    const previousScrollLeft = headerWrapper.dataset.lastScrollLeft || "-1";
    const needsHeaderUpdate = shouldForceFullRender || Math.abs(parseFloat(previousScrollLeft) - currentScrollLeftPx) > 1;

    if (needsHeaderUpdate) {
        headerWrapper.dataset.lastScrollLeft = currentScrollLeftPx;
        headerWrapper.innerHTML = generateHeaderHtml(timelineMinDate, timelineMaxDate, zoomLevel, currentScrollLeftPx, viewportWidthPx, stickyWidthPx);

        if (shouldForceFullRender) {
            decorationsContainer.innerHTML = generateDecorationsHtml(projectData, timelineMinDate, totalTimelineDays, zoomLevel, totalChartHeightPx, stickyColumnWidthStyle);
        }
    }

    // Render Visible Rows
    let rowsHtmlBuffer = "";
    for (let i = visibleStartIdx; i < visibleEndIdx; i++) {
        const task = flattenedTasks[i];
        const taskStartDate = new Date(task.calculatedStart); 
        const barLeftPx = Math.floor((taskStartDate - timelineMinDate) / TIME.MILLISECONDS_PER_DAY) * zoomLevel;
        const barWidthPx = Math.max((task.duration || 1) * zoomLevel, LAYOUT.MIN_BAR_WIDTH_PX);
        const folderTriangleHtml = getTriangle(task, task.isFolded);
        const isTaskSelected = selectedTaskFullIds.has(task.fullId);
        const depthClassName = `row-depth-${task.depth}`;
        const resolvedTaskColor = task.resolvedColor || COLORS.DEFAULT_TASK;
        
        const rowTopPx = LAYOUT.HEADER_HEIGHT_PX + i * LAYOUT.DEFAULT_ROW_HEIGHT_PX;

        rowsHtmlBuffer += `
            <div class="gantt-row ${isTaskSelected ? 'selected-row' : ''} ${depthClassName}" 
                 draggable="true" 
                 data-id="${task.fullId}" 
                 style="position: absolute; top: ${rowTopPx}px; left: 0; right: 0;">
                ${renderWBSColumns(task, folderTriangleHtml)}
                ${renderBar(task, barLeftPx, barWidthPx, resolvedTaskColor, isTaskSelected)}
            </div>`;
    }
    rowsContainer.innerHTML = rowsHtmlBuffer;

    if (dependencySvg) {
        renderDependencyLines(flattenedTasks, dependencySvg, zoomLevel);
    }
}

/**
 * Initializes the basic DOM structure for the Gantt chart.
 */
function initializeChartScaffold(chartContainerEl) {
    chartContainerEl.innerHTML = `
        <div class="gantt-header-wrapper" style="position: sticky; top: 0; z-index: ${Z_INDEX.TIMELINE_HEADER * 2}; background: var(--header-bg);"></div>
        <div class="gantt-rows-container" style="position: relative;"></div>
        <div class="gantt-decorations-container" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: ${Z_INDEX.DECORATIONS};"></div>
        <svg id="dependency-svg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: ${Z_INDEX.DEPENDENCY_SVG};">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="${COLORS.DEPENDENCY_LINE}" />
                </marker>
            </defs>
        </svg>
        <div class="hover-line" style="position: absolute; top: 0; bottom: 0; width: 0; border-left: 1px dotted #888; z-index: ${Z_INDEX.HOVER_LINE}; pointer-events: none; display: none;"></div>
    `;
}

/**
 * Generates the HTML for the sticky timeline header.
 */
function generateHeaderHtml(minDate, maxDate, zoom, scrollLeft, viewportWidth, stickyWidth) {
    return `
        <div class="gantt-header">
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
                ${renderAxis(minDate, maxDate, zoom, scrollLeft, viewportWidth, stickyWidth)}
            </div>
        </div>`;
}

/**
 * Generates the HTML for project-wide decorations like today's line and milestones.
 */
function generateDecorationsHtml(projectData, minDate, totalDays, zoom, chartHeight, stickyWidthStyle) {
    let decorationsHtml = "";
    const currentDateTime = new Date();
    const todayXOffsetPx = Math.floor((currentDateTime - minDate) / TIME.MILLISECONDS_PER_DAY) * zoom;
    
    if (todayXOffsetPx >= 0 && todayXOffsetPx <= totalDays * zoom) {
        decorationsHtml += `<div class="today-line" style="left: calc(${stickyWidthStyle} + ${todayXOffsetPx}px); height: ${chartHeight}px"></div>`;
    }

    if (projectData.milestones) {
        projectData.milestones.forEach((milestone, index) => {
            const milestoneDate = new Date(milestone.date + 'T00:00:00');
            const milestoneXOffsetPx = Math.floor((milestoneDate - minDate) / TIME.MILLISECONDS_PER_DAY) * zoom;
            
            if (milestoneXOffsetPx >= 0 && milestoneXOffsetPx <= totalDays * zoom) {
                decorationsHtml += `
                    <div class="milestone-container" style="left: calc(${stickyWidthStyle} + ${milestoneXOffsetPx}px); height: ${chartHeight}px">
                        <div class="milestone-line"></div>
                        <div class="milestone-diamond" 
                             data-action="milestoneDrag" data-index="${index}"
                             style="top: 0px;"
                             title="${milestone.name} - ${milestone.date}"></div>
                        <div class="milestone-diamond" 
                             data-action="milestoneDrag" data-index="${index}"
                             style="top: auto; bottom: 0px;"
                             title="${milestone.name} - ${milestone.date}"></div>
                        <div class="milestone-name">${milestone.name} (${milestone.date})</div>
                    </div>`;
            }
        });
    }
    return decorationsHtml;
}
