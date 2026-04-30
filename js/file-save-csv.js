import * as gantt from './gantt.js';
import { writeFile } from './file-system.js';

export async function saveCSV(projectData, showStatus) {
    try {
        const flat = gantt.flattenTasks(projectData.roots, 0, "", { 
            baseDate: projectData.baseDate 
        });

        let csv = "Root,Parent,Child,Sibling,Name,Start,End,Progress,Dependency\n";
        flat.forEach(t => {
            const name = t.name.replace(/"/g, '""');
            csv += `"${t.wbs_root}","${t.wbs_parent}","${t.wbs_child}","${t.wbs_sibling}","${name}","${t.calculatedStart}","${t.calculatedEnd}","${t.progress || 0}","${t.dependency || ''}"\n`;
        });

        if (projectData.milestones && projectData.milestones.length > 0) {
            csv += "\nMilestone,Date\n";
            projectData.milestones.forEach(m => {
                const mName = m.name.replace(/"/g, '""');
                csv += `"${mName}","${m.date}"\n`;
            });
        }

        const handle = await window.showSaveFilePicker({
            types: [{ description: 'CSV Files', accept: { 'text/csv': ['.csv'] } }],
        });
        await writeFile(handle, csv);
        showStatus("CSV exported successfully.");
    } catch (err) {
        if (err.name === 'AbortError') return;
        showStatus("CSV export failed: " + err.message, true);
    }
}
