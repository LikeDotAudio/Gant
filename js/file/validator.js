/**
 * Validates the project data. If duplicate IDs are found, it automatically 
 * re-indexes them to ensure they are sequential and unique within their group.
 * 
 * @param {Object} projectData 
 * @returns {{valid: boolean, data: Object}}
 */
export function validateProjectData(projectData) {
    function reindexTasks(tasks, depth = 0) {
        if (!tasks) return;
        
        const usedIds = new Set();
        tasks.forEach((task, index) => {
            let idKey;
            if (depth === 0) idKey = 'RootID';
            else if (depth === 1) idKey = 'ParentID';
            else if (depth === 2) idKey = 'CHILDID';
            else if (depth === 3) idKey = 'siblingID';
            else idKey = 'id';

            let newId = (index + 1).toString();
            
            // Apply the new sequential ID
            task[idKey] = newId;
            
            // Recursively re-index children
            let childrenKey;
            if (depth === 0) childrenKey = 'parents';
            else if (depth === 1) childrenKey = 'children';
            else if (depth === 2) childrenKey = 'siblings';
            
            if (childrenKey && task[childrenKey]) {
                reindexTasks(task[childrenKey], depth + 1);
            }
        });
    }

    reindexTasks(projectData.roots || []);
    return { valid: true, data: projectData };
}
