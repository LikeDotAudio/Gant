import { getChildren } from './getChildren.js';
import { getTaskId } from './id-manager.js';

export function flattenTasks(tasks, depth = 0, parentId = "", options = {}, result = [], inheritedColor = null) {
    const { rootId = null, baseDate = null, foldedIds = new Set() } = options;
    
    const globalBase = (baseDate && typeof baseDate === 'string' && !isNaN(new Date(baseDate).getTime())) 
        ? baseDate 
        : new Date().toISOString().split('T')[0];
    
    let runner;
    try {
        runner = new Date(globalBase.includes('T') ? globalBase : globalBase + 'T00:00:00');
        if (isNaN(runner.getTime())) runner = new Date();
    } catch (e) {
        runner = new Date();
    }

    if (!tasks) return result;
    const safeFoldedIds = (foldedIds instanceof Set) ? foldedIds : new Set();

    tasks.forEach((t) => {
        const tid = getTaskId(t);
        const fullId = (parentId ? `${parentId}.${tid}` : tid) || "0";
        const parts = fullId.split('.');
        
        if (t.start) {
            const parsedStart = new Date(t.start.includes('T') ? t.start : t.start + 'T00:00:00');
            if (!isNaN(parsedStart.getTime())) runner = parsedStart;
        }

        const childrenArr = getChildren(t);
        const hasChildren = (childrenArr && childrenArr.length > 0);
        const isFolded = safeFoldedIds.has(fullId);
        
        const taskColor = t.color || inheritedColor || '#f4902c';

        const taskEntry = { 
            name: t.name,
            progress: t.progress,
            color: t.color,
            resolvedColor: taskColor,
            dependency: t.dependency,
            start: t.start,
            duration: t.duration,
            type: t.type,
            hasChildren,
            depth, 
            fullId, 
            wbs_root: parts[0] || '-',
            wbs_parent: parts.length > 1 ? parts[1] : '-',
            wbs_child: parts.length > 2 ? parts[2] : '-',
            wbs_sibling: parts.length > 3 ? parts[3] : '-',
            isFolded,
            calculatedStart: runner.toISOString()
        };

        if (hasChildren && !isFolded) {
            const startIdx = result.length;
            result.push(taskEntry); 
            
            flattenTasks(childrenArr, depth + 1, fullId, {
                rootId: parts[0],
                baseDate: taskEntry.calculatedStart,
                foldedIds: safeFoldedIds
            }, result, taskColor);
            
            const children = result.slice(startIdx + 1);
            if (children.length > 0) {
                const validDates = children
                    .map(c => [new Date(c.calculatedStart), new Date(c.calculatedEnd)])
                    .flat()
                    .filter(d => !isNaN(d.getTime()));

                if (validDates.length > 0) {
                    const minChild = new Date(Math.min(...validDates));
                    const maxChild = new Date(Math.max(...validDates));
                    taskEntry.calculatedStart = minChild.toISOString();
                    taskEntry.calculatedEnd = maxChild.toISOString();
                    taskEntry.duration = (maxChild - minChild) / 86400000;
                }
            }
        } else {
            const d = (t.duration !== undefined) ? t.duration : 1;
            const start = new Date(runner); 
            const endObj = new Date(start.getTime() + (d * 86400000)); 
            taskEntry.calculatedEnd = endObj.toISOString();
            taskEntry.duration = d;
            result.push(taskEntry);
        }
        
        const ownDuration = (t.duration !== undefined) ? t.duration : 1;
        const waterfallEnd = new Date(new Date(taskEntry.calculatedStart).getTime() + (ownDuration * 86400000));
        
        if (!isNaN(waterfallEnd.getTime())) runner = waterfallEnd;
    });
    return result;
}

export function getFlattenedProject(tasks, options) {
    const flat = flattenTasks(tasks, 0, "", options, []);
    let min = null;
    let max = null;
    if (flat.length > 0) {
        flat.forEach(t => {
            const s = new Date(t.calculatedStart);
            const e = new Date(t.calculatedEnd);
            if (!isNaN(s.getTime()) && (!min || s < min)) min = s;
            if (!isNaN(e.getTime()) && (!max || e > max)) max = e;
        });
        
        if (min && !isNaN(min.getTime())) {
            const minCopy = new Date(min.getTime());
            minCopy.setDate(minCopy.getDate() - 5);
            
            const oneYearLater = new Date(minCopy);
            oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
            
            if (!max || max > oneYearLater) {
                max = oneYearLater;
            } else {
                max.setDate(max.getDate() + 10);
            }
            min = minCopy;
        }
    }
    return { 
        flat, 
        min: (min && !isNaN(min.getTime())) ? min.toISOString().split('T')[0] : null, 
        max: (max && !isNaN(max.getTime())) ? max.toISOString().split('T')[0] : null 
    };
}
