/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/timeline functionality.
 */

import { getSeason } from './getSeason.js';
import { getNextSeasonStart } from './getNextSeasonStart.js';
import { getQuarter } from './getQuarter.js';
import { getWeekNumber } from './getWeekNumber.js';

export function renderAxis(minDate, maxDate, zoomLevel, scrollLeft, viewportWidth, stickyWidthPx) {
    let html = '';

    // 1. SEASONS
    html += `<div class="timeline-seasons" style="position:relative; height:24px; border-bottom:1px solid var(--border-color); font-size: 0.9em; font-weight: bold; line-height: 24px;">`;
    let seasonRunner = new Date(minDate);
    while (seasonRunner < maxDate) {
        const currentSeason = getSeason(seasonRunner);
        const nextSeasonStart = getNextSeasonStart(seasonRunner);
        const daysInSeason = Math.ceil((nextSeasonStart - seasonRunner) / 86400000);
        const width = daysInSeason * zoomLevel;
        const left = Math.floor((seasonRunner - minDate) / 86400000) * zoomLevel;

        let bgColor = '#2c3e50';
        if (currentSeason === 'Spring') bgColor = '#27ae60';
        else if (currentSeason === 'Summer') bgColor = '#2980b9';
        else if (currentSeason === 'Fall') bgColor = '#d35400';
        else if (currentSeason === 'Winter') bgColor = '#ecf0f1';
        
        const textColor = (currentSeason === 'Winter') ? '#333' : '#fff';

        if (left + width > scrollLeft - stickyWidthPx && left < scrollLeft + viewportWidth) {
            html += `<div class="season-band" style="position:absolute; left:${left}px; width:${width}px; border-right:1px solid rgba(0,0,0,0.2); text-align:center; background:${bgColor}; color:${textColor};">${currentSeason}</div>`;
        }
        seasonRunner = nextSeasonStart;
    }
    html += `</div>`;

    // 2. QUARTERS
    html += `<div class="timeline-quarters" style="position:relative; height:20px; border-bottom:1px solid var(--border-color); font-size: 0.65em; line-height: 20px;">`;
    let quarterRunner = new Date(minDate);
    while (quarterRunner < maxDate) {
        const currentQ = getQuarter(quarterRunner);
        const nextQStart = new Date(quarterRunner.getFullYear(), (Math.floor(quarterRunner.getMonth() / 3) + 1) * 3, 1);
        const daysInQ = Math.ceil((nextQStart - quarterRunner) / 86400000);
        const width = daysInQ * zoomLevel;
        const left = Math.floor((quarterRunner - minDate) / 86400000) * zoomLevel;

        if (left + width > scrollLeft - stickyWidthPx && left < scrollLeft + viewportWidth) {
            html += `<div class="quarter-band" style="position:absolute; left:${left}px; width:${width}px; border-right:1px solid var(--border-color); text-align:center; background: #34495e; color: #ccc;">${currentQ} ${quarterRunner.getFullYear()}</div>`;
        }
        quarterRunner = nextQStart;
    }
    html += `</div>`;

    // 3. MONTHS
    html += `<div class="timeline-months" style="position:relative; height:20px; border-bottom:1px solid var(--border-color); font-size: 0.65em; line-height: 20px;">`;
    let monthRunner = new Date(minDate);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    while (monthRunner < maxDate) {
        const currentMonth = monthNames[monthRunner.getMonth()];
        const nextMonthStart = new Date(monthRunner.getFullYear(), monthRunner.getMonth() + 1, 1);
        const daysInMonth = Math.ceil((nextMonthStart - monthRunner) / 86400000);
        const width = daysInMonth * zoomLevel;
        const left = Math.floor((monthRunner - minDate) / 86400000) * zoomLevel;

        if (left + width > scrollLeft - stickyWidthPx && left < scrollLeft + viewportWidth) {
            html += `<div class="month-band" style="position:absolute; left:${left}px; width:${width}px; border-right:1px solid var(--border-color); text-align:center; background: #2c3e50; color: #aaa;">${currentMonth}</div>`;
        }
        monthRunner = nextMonthStart;
    }
    html += `</div>`;

    // 4. WEEKS
    html += `<div class="timeline-weeks" style="position:relative; height:20px; border-bottom:1px solid var(--border-color);">`;
    let weekRunner = new Date(minDate);
    while (weekRunner < maxDate) {
        const daysInWeek = 7 - (weekRunner.getDay() === 0 ? 0 : weekRunner.getDay()); // To Sunday
        const adjustedDays = daysInWeek === 0 ? 7 : daysInWeek;
        const width = adjustedDays * zoomLevel;
        const left = Math.floor((weekRunner - minDate) / 86400000) * zoomLevel;

        if (left + width > scrollLeft - stickyWidthPx && left < scrollLeft + viewportWidth) {
            html += `<div class="week-band" style="position:absolute; left:${left}px; width:${width}px; border-right:1px solid var(--border-color); text-align:center; font-size:0.65em; line-height:20px;">W${getWeekNumber(weekRunner)}</div>`;
        }
        weekRunner.setDate(weekRunner.getDate() + adjustedDays);
    }
    html += `</div>`;

    // 5. DAYS (with 1/4 resolution)
    html += `<div class="timeline-days" style="position:relative; height:20px;">`;
    const startDay = Math.max(0, Math.floor((scrollLeft - stickyWidthPx) / zoomLevel));
    const endDay = Math.min(Math.ceil((maxDate - minDate) / 86400000), Math.ceil((scrollLeft + viewportWidth) / zoomLevel));

    for (let i = startDay; i < endDay; i++) {
        let d = new Date(minDate);
        d.setDate(d.getDate() + i);
        const showHourLabels = zoomLevel > 120;
        
        html += `<div class="day-col" style="position:absolute; left:${i * zoomLevel}px; width:${zoomLevel}px; display: flex; border-right:1px solid #333; height: 100%;">
                    <div style="flex:1; border-right:1px solid rgba(255,255,255,0.05); font-size:0.6em; text-align:center;">${d.getMonth() + 1}/${d.getDate()}${showHourLabels ? ' 00' : ''}</div>
                    <div style="flex:1; border-right:1px solid rgba(255,255,255,0.05); font-size:0.5em; text-align:center; color:#555;">${showHourLabels ? '06' : ''}</div>
                    <div style="flex:1; border-right:1px solid rgba(255,255,255,0.05); font-size:0.5em; text-align:center; color:#555;">${showHourLabels ? '12' : ''}</div>
                    <div style="flex:1; font-size:0.5em; text-align:center; color:#555;">${showHourLabels ? '18' : ''}</div>
                  </div>`;
    }
    html += `</div>`;

    return html;
}
