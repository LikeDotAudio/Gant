import { flattenTasks } from './flattenTasks.js';

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
