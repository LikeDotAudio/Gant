export function getChildren(t) {
    if (!t) return null;
    return t.roots || t.parents || t.children || t.siblings || null;
}

export function setChildren(t, arr) {
    if (!t) return;
    if (t.roots) t.roots = arr;
    else if (t.parents) t.parents = arr;
    else if (t.children) t.children = arr;
    else if (t.siblings) t.siblings = arr;
    else t.children = arr; // Default
}

export function getTaskId(t) {
    if (!t) return "0";
    return (t.RootID || t.ParentID || t.CHILDID || t.siblingID || t.id || "0").toString();
}

export function setTaskId(t, val, depth) {
    if (!t) return;
    if (depth === 0) t.RootID = val;
    else if (depth === 1) t.ParentID = val;
    else if (depth === 2) t.CHILDID = val;
    else if (depth === 3) t.siblingID = val;
    else t.id = val;
}

function safeISODate(date) {
    try {
        if (!date || typeof date.getTime !== 'function' || isNaN(date.getTime())) {
            return new Date().toISOString().split('T')[0];
        }
        return date.toISOString().split('T')[0];
    } catch (e) {
        return new Date().toISOString().split('T')[0];
    }
}

export function flattenTasks(tasks, depth = 0, parentId = "", options = {}, result = [], inheritedColor = null) {
    const { rootId = null, baseDate = null, foldedIds = new Set() } = options;
    
    const globalBase = (baseDate && typeof baseDate === 'string' && !isNaN(new Date(baseDate).getTime())) 
        ? baseDate 
        : new Date().toISOString().split('T')[0];
    
    let runner;
    try {
        runner = new Date(globalBase + 'T00:00:00');
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
        
        // Explicit dates override the current runner
        if (t.start) {
            const parsedStart = new Date(t.start + 'T00:00:00');
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
            calculatedStart: safeISODate(runner)
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
                    .map(c => [new Date(c.calculatedStart + 'T00:00:00'), new Date(c.calculatedEnd + 'T00:00:00')])
                    .flat()
                    .filter(d => !isNaN(d.getTime()));

                if (validDates.length > 0) {
                    const minChild = new Date(Math.min(...validDates));
                    const maxChild = new Date(Math.max(...validDates));
                    taskEntry.calculatedStart = safeISODate(minChild);
                    taskEntry.calculatedEnd = safeISODate(maxChild);
                    taskEntry.duration = Math.ceil((maxChild - minChild) / 86400000);
                }
            }
        } else {
            const d = (t.duration !== undefined) ? t.duration : 1;
            const start = new Date(runner); 
            const endObj = new Date(start); 
            endObj.setDate(endObj.getDate() + d);
            taskEntry.calculatedEnd = safeISODate(endObj);
            taskEntry.duration = d;
            result.push(taskEntry);
        }
        
        // Waterfall logic: move runner based on this task's own duration
        // This ensures the waterfall "resets" its scale at each level and parents don't bloat the sibling sequence
        const ownDuration = (t.duration !== undefined) ? t.duration : 1;
        const waterfallEnd = new Date(taskEntry.calculatedStart + 'T00:00:00');
        waterfallEnd.setDate(waterfallEnd.getDate() + ownDuration);
        
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
            const s = new Date(t.calculatedStart + 'T00:00:00');
            const e = new Date(t.calculatedEnd + 'T00:00:00');
            if (!isNaN(s.getTime()) && (!min || s < min)) min = s;
            if (!isNaN(e.getTime()) && (!max || e > max)) max = e;
        });
        if (min && !isNaN(min.getTime())) min.setDate(min.getDate() - 5);
        if (max && !isNaN(max.getTime())) max.setDate(max.getDate() + 10);
    }
    return { 
        flat, 
        min: (min && !isNaN(min.getTime())) ? min.toISOString().split('T')[0] : null, 
        max: (max && !isNaN(max.getTime())) ? max.toISOString().split('T')[0] : null 
    };
}

export function findParentAndIndex(tasks, fullId, parent = null) {
    if (!tasks) return { parent: null, index: -1 };
    for (let i = 0; i < tasks.length; i++) {
        const t = tasks[i];
        const tid = getTaskId(t);
        const currentFullId = parent ? `${parent.fullId}.${tid}` : tid;
        if (currentFullId === fullId) {
            return { parent: parent ? { ...parent, children: getChildren(parent) } : { children: tasks }, index: i };
        }
        const children = getChildren(t);
        if (children) {
            const res = findParentAndIndex(children, fullId, { ...t, fullId: currentFullId });
            if (res.parent) return res;
        }
    }
    return { parent: null, index: -1 };
}

export function findTask(tasks, fullId) { 
    const { parent, index } = findParentAndIndex(tasks, fullId); 
    return (parent && index !== -1) ? parent.children[index] : null; 
}

export function getFullIdOfParent(tasks, fullId) {
    if (!fullId) return null;
    const parts = fullId.split('.');
    if (parts.length <= 1) return null;
    return parts.slice(0, -1).join('.');
}

export function findFullId(tasks, targetTask, parentId = "") {
    for (let t of tasks) {
        const tid = getTaskId(t);
        const fullId = parentId ? `${parentId}.${tid}` : tid;
        if (t === targetTask) return fullId;
        const children = getChildren(t);
        if (children) {
            const found = findFullId(children, targetTask, fullId);
            if (found) return found;
        }
    }
    return null;
}

export function refreshIds(tasks, depth = 0) { 
    tasks.forEach((t, i) => { 
        setTaskId(t, (i + 1).toString(), depth);
        const children = getChildren(t);
        if (children) refreshIds(children, depth + 1); 
    }); 
}

export function getWeekNumber(d) { 
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); 
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7)); 
    return Math.ceil((( (d - new Date(Date.UTC(d.getUTCFullYear(),0,1))) / 86400000) + 1)/7); 
}
