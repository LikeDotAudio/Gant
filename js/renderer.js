import * as gantt from './gantt.js';
import * as fold from './FoldTree.js';

function getResistorClass(val) {
    const num = parseInt(val);
    if (isNaN(num) || num < 0 || num > 9) return 'res-none';
    return `res-${num} res-cell`;
}

function getContrastColor(hex) {
    if (!hex || hex.length < 6) return 'white';
    if (hex.startsWith('rgba') || hex === 'transparent') return 'white';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
}

function renderWBSColumns(t, triangle) {
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
        <div class="d-cell c-start" data-action="selectTask" data-id="${t.fullId}">${t.calculatedStart}</div>
        <div class="d-cell c-end" data-action="selectTask" data-id="${t.fullId}">${t.calculatedEnd}</div>
        <div class="d-cell c-dur" data-action="selectTask" data-id="${t.fullId}">${t.duration || 0}</div>
    `;
}

function renderTimelineChart(t, l, w, taskColor) {
    const showText = w > 40; 
    const textColor = getContrastColor(taskColor);
    return `
        <div class="task-bars-cell" onmouseenter="this.parentElement.draggable=false" onmouseleave="this.parentElement.draggable=true">
            <div class="bar ${t.wbs_sibling==='-'?'summary-bar':''}" 
                 style="left:${l}px; width:${w}px; background-color:${taskColor}; color:${textColor};" 
                 data-action="barInteract" data-id="${t.fullId}">
                <div class="bar-handle bar-handle-left" data-action="resize-left"></div>
                <div class="progress-overlay" style="width:${t.progress || 0}%"></div>
                <div class="bar-content">${showText ? `${t.name} (${t.progress || 0}%)` : ''}</div>
                <div class="bar-handle bar-handle-right" data-action="resize-right"></div>
            </div>
        </div>
    `;
}

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
    
    const rowHeight = 60;
    const headerHeight = 42; 
    const totalHeight = headerHeight + (flat.length * rowHeight);
    const viewportHeight = container.clientHeight || 800;
    const viewportWidth = container.clientWidth || 1000;
    const scrollTop = container.scrollTop;
    const scrollLeft = container.scrollLeft;
    
    const startIdx = Math.max(0, Math.floor((scrollTop - headerHeight) / rowHeight));
    const endIdx = Math.min(flat.length, Math.ceil((scrollTop + viewportHeight - headerHeight) / rowHeight) + 1);

    const stickyWidthPx = 35 + 35 + 35 + 35 + 70 + 80 + 280 + 50 + 90 + 90 + 50; 
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
            <div class="h-cell c-root">Root</div><div class="h-cell c-parent">Parent</div><div class="h-cell c-child">Child</div><div class="h-cell c-sibling">Siblings</div><div class="h-cell c-color">Color</div><div class="h-cell c-dep">Dependency</div><div class="h-cell c-name">Task Name</div><div class="h-cell c-prog">Progress</div><div class="h-cell c-start">Start</div><div class="h-cell c-end">End</div><div class="h-cell c-dur">Days</div>
            <div class="gantt-timeline" style="position:relative; flex-grow:1; overflow:hidden;" data-action="addMilestone" data-min-date="${minDate.toISOString()}" title="Double click to add Milestone">
                <div class="timeline-weeks" style="position:relative; height:20px;">`;
        
        let weekRunner = new Date(minDate);
        while(weekRunner < maxDate) {
            const daysInWeek = 7 - weekRunner.getDay();
            const weekWidth = daysInWeek * zoomLevel;
            const weekLeft = Math.floor((weekRunner - minDate) / 86400000) * zoomLevel;
            
            if (weekLeft + weekWidth > scrollLeft - stickyWidthPx && weekLeft < scrollLeft + viewportWidth) {
                h += `<div class="week-band" style="position:absolute; left:${weekLeft}px; width: ${weekWidth}px">W${gantt.getWeekNumber(weekRunner)}</div>`;
            }
            weekRunner.setDate(weekRunner.getDate() + daysInWeek);
        }
        h += `</div><div class="timeline-days" style="position:relative; height:20px;">`;
        
        for(let i = visibleStartDay; i < visibleEndDay; i++) { 
            let d = new Date(minDate); d.setDate(d.getDate() + i); 
            h += `<div class="day-col" style="position:absolute; left:${i * zoomLevel}px; width:${zoomLevel}px; display: flex;">
                    <div style="flex:1; border-right:1px solid rgba(255,255,255,0.05); height:100%; box-sizing:border-box;">${d.getMonth()+1}/${d.getDate()}</div>
                    <div style="flex:1; border-right:1px solid rgba(255,255,255,0.05); height:100%;"></div>
                    <div style="flex:1; border-right:1px solid rgba(255,255,255,0.05); height:100%;"></div>
                    <div style="flex:1; height:100%;"></div>
                  </div>`; 
        }
        h += `</div></div></div>`;
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
        const triangle = fold.getTriangle(t, t.isFolded);
        const isSelected = selectedTaskFullId === t.fullId;
        const depthClass = `row-depth-${t.depth}`;
        const taskColor = t.resolvedColor || '#f4902c';

        rowH += `<div class="gantt-row ${isSelected?'selected-row':''} ${depthClass}" draggable="true" 
                data-id="${t.fullId}" 
                style="position: absolute; top: ${headerHeight + i * rowHeight}px; left: 0; right: 0;">
            ${renderWBSColumns(t, triangle)}
            ${renderTimelineChart(t, l, w, taskColor)}
        </div>`;
    }
    rowsContainer.innerHTML = rowH;
}
