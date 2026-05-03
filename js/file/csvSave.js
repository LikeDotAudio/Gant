import * as gantt from '../Rows/index.js';
import { writeFile } from './system.js';
export async function saveCSV(projectData, showStatus) {
    try {
        const flat = gantt.flattenTasks(projectData.roots, 0, "", { 
            baseDate: projectData.baseDate 
        });
        let csv = "ID,Color,Dependency,Task Name,Progress,Start,Duration\n";
        flat.forEach(t => {
            const name = t.name.replace(/"/g, '""');
            csv += `"${t.fullId}","${t.color || ''}","${t.dependency || ''}","${name}","${t.progress || 0}","${t.calculatedStart}","${t.duration || 1}"\n`;
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
