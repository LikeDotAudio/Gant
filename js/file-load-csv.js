export async function loadCSV(state, render, showStatus) {
    try {
        const [handle] = await window.showOpenFilePicker({
            types: [{ description: 'CSV Files', accept: { 'text/csv': ['.csv'] } }],
        });
        const file = await handle.getFile();
        const text = await file.text();
        
        // Simple CSV parser
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const roots = [];
        const milestones = [];
        const taskMap = new Map();
        let mode = 'tasks';

        lines.slice(1).forEach(line => {
            if (line.toLowerCase().startsWith('milestone,date')) {
                mode = 'milestones';
                return;
            }

            const parts = line.split(',').map(s => s.replace(/^"|"$/g, '').trim());
            
            if (mode === 'milestones') {
                if (parts.length >= 2) {
                    milestones.push({ name: parts[0], date: parts[1] });
                }
                return;
            }

            const [id, name, progress, color, dependency] = parts;
            if (!id || id === 'Root') return; // Skip header or empty

            const task = { 
                id: id.split('.').pop(), 
                name, 
                progress: parseInt(progress) || 0, 
                color, 
                dependency 
            };
            taskMap.set(id, task);

            const idParts = id.split('.');
            if (idParts.length === 1) {
                roots.push(task);
                task.type = "summary";
                task.parents = [];
            } else {
                const parentId = idParts.slice(0, -1).join('.');
                const parent = taskMap.get(parentId);
                if (parent) {
                    if (idParts.length === 2) {
                        if (!parent.parents) parent.parents = [];
                        parent.parents.push(task);
                        task.children = [];
                    } else if (idParts.length === 3) {
                        if (!parent.children) parent.children = [];
                        parent.children.push(task);
                        task.siblings = [];
                    } else if (idParts.length === 4) {
                        if (!parent.siblings) parent.siblings = [];
                        parent.siblings.push(task);
                    }
                    parent.type = "summary";
                }
            }
        });

        state.projectData.roots = roots;
        state.projectData.milestones = milestones;
        render();
        showStatus(`Imported CSV: ${file.name}`);
    } catch (err) {
        if (err.name === 'AbortError') return;
        showStatus("CSV import failed: " + err.message, true);
    }
}
