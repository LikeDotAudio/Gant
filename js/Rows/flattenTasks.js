/**
 * js/Rows/flattenTasks.js
 * Logic for converting the hierarchical project tree into a flat array for rendering and search.
 * Calculates cascading dates, durations, and inherited styles recursively.
 */

import { getChildren } from './getChildren.js';
import { getTaskId } from './getTaskId.js';
import { resolveTaskColor } from './colorResolver.js';
import { TIME } from '../core/constants.js';

/**
 * Flattens the hierarchical project tree into a linear list for rendering.
 * 
 * @param {Array<Object>} taskHierarchy - The nested list of tasks.
 * @param {number} currentDepth - Nesting level (0=Root).
 * @param {string} parentFullId - The dot-notated ID of the parent task.
 * @param {Object} options - Flattening options (baseDate, foldedIds).
 * @param {Array<Object>} flatResultList - Accumulator for the flattened tasks.
 * @param {string|null} inheritedColorHex - Color hex inherited from a parent.
 * @returns {Array<Object>} The final flat list of tasks.
 */
export function flattenTasks(
    taskHierarchy, 
    currentDepth = 0, 
    parentFullId = "", 
    options = {}, 
    flatResultList = [], 
    inheritedColorHex = null
) {
    const { baseDate = null, foldedIds = new Set() } = options;
    
    // Determine the starting anchor date for this level's waterfall
    const globalBaseDateStr = (baseDate && typeof baseDate === 'string' && !isNaN(new Date(baseDate).getTime())) 
        ? baseDate 
        : new Date().toISOString().split('T')[0];
    
    let waterfallCursorDate;
    try {
        waterfallCursorDate = new Date(globalBaseDateStr.includes('T') ? globalBaseDateStr : globalBaseDateStr + 'T00:00:00');
        if (isNaN(waterfallCursorDate.getTime())) waterfallCursorDate = new Date();
    } catch (error) {
        waterfallCursorDate = new Date();
    }

    if (!taskHierarchy) return flatResultList;
    const safeFoldedIds = (foldedIds instanceof Set) ? foldedIds : new Set();

    taskHierarchy.forEach((task) => {
        const localTaskId = getTaskId(task);
        const fullTaskId = (parentFullId ? `${parentFullId}.${localTaskId}` : localTaskId) || "0";
        const idParts = fullTaskId.split('.');
        
        // If task has an explicit start date, it resets the waterfall cursor for its own branch
        if (task.start) {
            const explicitStartTime = new Date(task.start.includes('T') ? task.start : task.start + 'T00:00:00');
            if (!isNaN(explicitStartTime.getTime())) waterfallCursorDate = explicitStartTime;
        }

        const taskChildren = getChildren(task);
        const hasChildren = (taskChildren && taskChildren.length > 0);
        const isTaskFolded = safeFoldedIds.has(fullTaskId);
        
        const resolvedTaskColor = resolveTaskColor(task, currentDepth, localTaskId, inheritedColorHex);

        // Prepare the flat entry
        const flattenedTaskEntry = { 
            name: task.name,
            progress: task.progress,
            color: task.color,
            resolvedColor: resolvedTaskColor,
            dependency: task.dependency,
            start: task.start,
            duration: task.duration,
            type: task.type,
            hasChildren,
            depth: currentDepth, 
            fullId: fullTaskId, 
            // WBS breakdown for spreadsheet/sorting
            wbs_root: idParts[0] || '-',
            wbs_parent: idParts.length > 1 ? idParts[1] : '-',
            wbs_child: idParts.length > 2 ? idParts[2] : '-',
            wbs_sibling: idParts.length > 3 ? idParts[3] : '-',
            isFolded: isTaskFolded,
            calculatedStart: waterfallCursorDate.toISOString()
        };

        if (hasChildren && !isTaskFolded) {
            const startIdxInResult = flatResultList.length;
            flatResultList.push(flattenedTaskEntry); 
            
            // Recurse into children
            flattenTasks(
                taskChildren, 
                currentDepth + 1, 
                fullTaskId, 
                {
                    baseDate: flattenedTaskEntry.calculatedStart,
                    foldedIds: safeFoldedIds
                }, 
                flatResultList, 
                task.color || inheritedColorHex
            );
            
            // Summary tasks (parents) take the bounds of their children
            const flattenedChildren = flatResultList.slice(startIdxInResult + 1);
            if (flattenedChildren.length > 0) {
                const childDates = flattenedChildren
                    .map(child => [new Date(child.calculatedStart), new Date(child.calculatedEnd)])
                    .flat()
                    .filter(date => !isNaN(date.getTime()));
                
                if (childDates.length > 0) {
                    const minChildDate = new Date(Math.min(...childDates));
                    const maxChildDate = new Date(Math.max(...childDates));
                    flattenedTaskEntry.calculatedStart = minChildDate.toISOString();
                    flattenedTaskEntry.calculatedEnd = maxChildDate.toISOString();
                    flattenedTaskEntry.duration = (maxChildDate - minChildDate) / TIME.MILLISECONDS_PER_DAY;
                }
            }
        } else {
            // Leaf task or folded parent: use its own duration
            const taskDurationDays = (task.duration !== undefined) ? task.duration : 1;
            const calculatedEndDate = new Date(waterfallCursorDate.getTime() + (taskDurationDays * TIME.MILLISECONDS_PER_DAY)); 
            
            flattenedTaskEntry.calculatedEnd = calculatedEndDate.toISOString();
            flattenedTaskEntry.duration = taskDurationDays;
            flatResultList.push(flattenedTaskEntry);
        }

        // Advance the waterfall cursor for the NEXT sibling at this level
        const currentTaskDuration = (task.duration !== undefined) ? task.duration : 1;
        const nextWaterfallStart = new Date(new Date(flattenedTaskEntry.calculatedStart).getTime() + (currentTaskDuration * TIME.MILLISECONDS_PER_DAY));
        if (!isNaN(nextWaterfallStart.getTime())) {
            waterfallCursorDate = nextWaterfallStart;
        }
    });

    return flatResultList;
}
