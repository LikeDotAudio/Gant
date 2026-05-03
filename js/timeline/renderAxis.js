/**
 * js/timeline/renderAxis.js
 * Renders the multi-layered temporal axis (Seasons, Quarters, Months, Weeks, Days).
 * Uses virtualization to only render bands that are currently visible within the viewport.
 */

import { getSeason } from './getSeason.js';
import { getNextSeasonStart } from './getNextSeasonStart.js';
import { getQuarter } from './getQuarter.js';
import { getWeekNumber } from './getWeekNumber.js';
import { TIME, LAYOUT } from '../core/constants.js';

/**
 * Generates the HTML for the timeline axis.
 * 
 * @param {Date} projectMinDate - Earliest date in the project.
 * @param {Date} projectMaxDate - Latest date in the project.
 * @param {number} pixelsPerDayZoom - Horizontal scale factor.
 * @param {number} viewportScrollLeftPx - Current horizontal scroll position.
 * @param {number} viewportWidthPx - Width of the visible area.
 * @param {number} stickyColumnsWidthPx - Width of the sticky labels on the left.
 * @returns {string} Concatenated HTML string for all axis layers.
 */
export function renderAxis(
    projectMinDate, 
    projectMaxDate, 
    pixelsPerDayZoom, 
    viewportScrollLeftPx, 
    viewportWidthPx, 
    stickyColumnsWidthPx
) {
    let axisHtmlBuffer = '';

    // 1. SEASONS LAYER
    axisHtmlBuffer += `<div class="timeline-seasons" style="position:relative; height:24px; border-bottom:1px solid var(--border-color); font-size: 0.9em; font-weight: bold; line-height: 24px;">`;
    let seasonDateCursor = new Date(projectMinDate);
    while (seasonDateCursor < projectMaxDate) {
        const seasonName = getSeason(seasonDateCursor);
        const nextSeasonStartDate = getNextSeasonStart(seasonDateCursor);
        const daysInCurrentSeason = Math.ceil((nextSeasonStartDate - seasonDateCursor) / TIME.MILLISECONDS_PER_DAY);
        
        const bandWidthPx = daysInCurrentSeason * pixelsPerDayZoom;
        const bandLeftPx = Math.floor((seasonDateCursor - projectMinDate) / TIME.MILLISECONDS_PER_DAY) * pixelsPerDayZoom;
        
        const seasonColorStyles = getSeasonStyles(seasonName);
        
        // Visibility check (Virtualization)
        if (bandLeftPx + bandWidthPx > viewportScrollLeftPx - stickyColumnsWidthPx && bandLeftPx < viewportScrollLeftPx + viewportWidthPx) {
            axisHtmlBuffer += `
                <div class="season-band" style="position:absolute; left:${bandLeftPx}px; width:${bandWidthPx}px; border-right:1px solid rgba(0,0,0,0.2); text-align:center; background:${seasonColorStyles.bg}; color:${seasonColorStyles.text};">
                    ${seasonName}
                </div>`;
        }
        seasonDateCursor = nextSeasonStartDate;
    }
    axisHtmlBuffer += `</div>`;

    // 2. QUARTERS LAYER
    axisHtmlBuffer += `<div class="timeline-quarters" style="position:relative; height:20px; border-bottom:1px solid var(--border-color); font-size: 0.65em; line-height: 20px;">`;
    let quarterDateCursor = new Date(projectMinDate);
    while (quarterDateCursor < projectMaxDate) {
        const quarterLabel = getQuarter(quarterDateCursor);
        const nextQuarterStartDate = new Date(quarterDateCursor.getFullYear(), (Math.floor(quarterDateCursor.getMonth() / 3) + 1) * 3, 1);
        const daysInCurrentQuarter = Math.ceil((nextQuarterStartDate - quarterDateCursor) / TIME.MILLISECONDS_PER_DAY);
        
        const bandWidthPx = daysInCurrentQuarter * pixelsPerDayZoom;
        const bandLeftPx = Math.floor((quarterDateCursor - projectMinDate) / TIME.MILLISECONDS_PER_DAY) * pixelsPerDayZoom;
        
        if (bandLeftPx + bandWidthPx > viewportScrollLeftPx - stickyColumnsWidthPx && bandLeftPx < viewportScrollLeftPx + viewportWidthPx) {
            axisHtmlBuffer += `
                <div class="quarter-band" style="position:absolute; left:${bandLeftPx}px; width:${bandWidthPx}px; border-right:1px solid var(--border-color); text-align:center; background: #34495e; color: #ccc;">
                    ${quarterLabel} ${quarterDateCursor.getFullYear()}
                </div>`;
        }
        quarterDateCursor = nextQuarterStartDate;
    }
    axisHtmlBuffer += `</div>`;

    // 3. MONTHS LAYER
    axisHtmlBuffer += `<div class="timeline-months" style="position:relative; height:20px; border-bottom:1px solid var(--border-color); font-size: 0.65em; line-height: 20px;">`;
    let monthDateCursor = new Date(projectMinDate);
    const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    while (monthDateCursor < projectMaxDate) {
        const monthName = MONTH_NAMES[monthDateCursor.getMonth()];
        const nextMonthStartDate = new Date(monthDateCursor.getFullYear(), monthDateCursor.getMonth() + 1, 1);
        const daysInCurrentMonth = Math.ceil((nextMonthStartDate - monthDateCursor) / TIME.MILLISECONDS_PER_DAY);
        
        const bandWidthPx = daysInCurrentMonth * pixelsPerDayZoom;
        const bandLeftPx = Math.floor((monthDateCursor - projectMinDate) / TIME.MILLISECONDS_PER_DAY) * pixelsPerDayZoom;
        
        if (bandLeftPx + bandWidthPx > viewportScrollLeftPx - stickyColumnsWidthPx && bandLeftPx < viewportScrollLeftPx + viewportWidthPx) {
            axisHtmlBuffer += `
                <div class="month-band" style="position:absolute; left:${bandLeftPx}px; width:${bandWidthPx}px; border-right:1px solid var(--border-color); text-align:center; background: #2c3e50; color: #aaa;">
                    ${monthName}
                </div>`;
        }
        monthDateCursor = nextMonthStartDate;
    }
    axisHtmlBuffer += `</div>`;

    // 4. WEEKS LAYER
    axisHtmlBuffer += `<div class="timeline-weeks" style="position:relative; height:20px; border-bottom:1px solid var(--border-color);">`;
    let weekDateCursor = new Date(projectMinDate);
    while (weekDateCursor < projectMaxDate) {
        const daysUntilNextSunday = 7 - (weekDateCursor.getDay() === 0 ? 0 : weekDateCursor.getDay());
        const daysInCurrentWeekChunk = daysUntilNextSunday === 0 ? 7 : daysUntilNextSunday;
        
        const bandWidthPx = daysInCurrentWeekChunk * pixelsPerDayZoom;
        const bandLeftPx = Math.floor((weekDateCursor - projectMinDate) / TIME.MILLISECONDS_PER_DAY) * pixelsPerDayZoom;
        
        if (bandLeftPx + bandWidthPx > viewportScrollLeftPx - stickyColumnsWidthPx && bandLeftPx < viewportScrollLeftPx + viewportWidthPx) {
            axisHtmlBuffer += `
                <div class="week-band" style="position:absolute; left:${bandLeftPx}px; width:${bandWidthPx}px; border-right:1px solid var(--border-color); text-align:center; font-size:0.65em; line-height:20px;">
                    W${getWeekNumber(weekDateCursor)}
                </div>`;
        }
        weekDateCursor.setDate(weekDateCursor.getDate() + daysInCurrentWeekChunk);
    }
    axisHtmlBuffer += `</div>`;

    // 5. DAYS LAYER
    axisHtmlBuffer += `<div class="timeline-days" style="position:relative; height:20px;">`;
    const startDayIndex = Math.max(0, Math.floor((viewportScrollLeftPx - stickyColumnsWidthPx) / pixelsPerDayZoom));
    const totalProjectDays = Math.ceil((projectMaxDate - projectMinDate) / TIME.MILLISECONDS_PER_DAY);
    const endDayIndex = Math.min(totalProjectDays, Math.ceil((viewportScrollLeftPx + viewportWidthPx) / pixelsPerDayZoom));
    
    for (let dayOffset = startDayIndex; dayOffset < endDayIndex; dayOffset++) {
        let currentDayDate = new Date(projectMinDate);
        currentDayDate.setDate(currentDayDate.getDate() + dayOffset);
        
        const shouldShowHourLabels = pixelsPerDayZoom > 120;
        const leftPx = dayOffset * pixelsPerDayZoom;

        axisHtmlBuffer += `
            <div class="day-col" style="position:absolute; left:${leftPx}px; width:${pixelsPerDayZoom}px; display: flex; border-right:1px solid #333; height: 100%;">
                <div style="flex:1; border-right:1px solid rgba(255,255,255,0.05); font-size:0.6em; text-align:center;">
                    ${currentDayDate.getMonth() + 1}/${currentDayDate.getDate()}${shouldShowHourLabels ? ' 00' : ''}
                </div>
                <div style="flex:1; border-right:1px solid rgba(255,255,255,0.05); font-size:0.5em; text-align:center; color:#555;">
                    ${shouldShowHourLabels ? '06' : ''}
                </div>
                <div style="flex:1; border-right:1px solid rgba(255,255,255,0.05); font-size:0.5em; text-align:center; color:#555;">
                    ${shouldShowHourLabels ? '12' : ''}
                </div>
                <div style="flex:1; font-size:0.5em; text-align:center; color:#555;">
                    ${shouldShowHourLabels ? '18' : ''}
                </div>
            </div>`;
    }
    axisHtmlBuffer += `</div>`;

    return axisHtmlBuffer;
}

/**
 * Returns background and text colors for a given season.
 * @param {string} seasonName 
 * @returns {{bg: string, text: string}}
 */
function getSeasonStyles(seasonName) {
    switch (seasonName) {
        case 'Spring': return { bg: '#27ae60', text: '#fff' };
        case 'Summer': return { bg: '#2980b9', text: '#fff' };
        case 'Fall':   return { bg: '#d35400', text: '#fff' };
        case 'Winter': return { bg: '#ecf0f1', text: '#333' };
        default:       return { bg: '#2c3e50', text: '#fff' };
    }
}
