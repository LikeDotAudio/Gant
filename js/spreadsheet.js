import * as gantt from './gantt.js';

const resistorColors = [
    '#000000', '#5d4037', '#ff0000', '#ff9800', '#ffff00', 
    '#00ff00', '#2196f3', '#9c27b0', '#9e9e9e', '#ffffff'
];

function getResistorStyle(val) {
    const num = parseInt(val);
    if (isNaN(num) || num < 0 || num > 9) return 'background: #242629; color: #888; border: none;';
    const bg = resistorColors[num];
    const color = (num === 4 || num === 9) ? '#000' : '#fff'; // Black text for yellow/white
    return `background: ${bg}; color: ${color}; border: 1px solid rgba(255,255,255,0.1);`;
}

export function renderSpreadsheet(projectData, container, cachedFlat = null) {
    if (!projectData.roots) return;
    
    const flat = cachedFlat || gantt.flattenTasks(projectData.roots, 0, "", { 
        baseDate: projectData.baseDate 
    });

    let h = `<table style="width:100%; border-collapse: collapse; color: #ccc; font-size: 0.85em; background: #1a1c1e;">
        <thead>
            <tr style="background: #242629; position: sticky; top: 0; z-index: 10;">
                <th style="width: 40px; padding: 8px; border: 1px solid #444;">R</th>
                <th style="width: 40px; padding: 8px; border: 1px solid #444;">P</th>
                <th style="width: 40px; padding: 8px; border: 1px solid #444;">C</th>
                <th style="width: 40px; padding: 8px; border: 1px solid #444;">S</th>
                <th style="padding: 8px; border: 1px solid #444; text-align: left;">Task Name</th>
                <th style="width: 90px; padding: 8px; border: 1px solid #444;">Start</th>
                <th style="width: 90px; padding: 8px; border: 1px solid #444;">End</th>
                <th style="width: 50px; padding: 8px; border: 1px solid #444;">%</th>
                <th style="width: 70px; padding: 8px; border: 1px solid #444;">Dep</th>
            </tr>
        </thead>
        <tbody>`;

    flat.forEach(t => {
        const isRoot = t.depth === 0;
        const rowBg = isRoot ? '#000' : 'transparent';
        const rowColor = isRoot ? '#fff' : '#ccc';
        const rowWeight = isRoot ? 'bold' : 'normal';
        
        h += `<tr style="background: ${rowBg}; color: ${rowColor}; font-weight: ${rowWeight}; border-bottom: 1px solid #333;">
            <td style="padding: 4px; border: 1px solid #444; text-align: center; ${getResistorStyle(t.wbs_root)}">${t.wbs_root}</td>
            <td style="padding: 4px; border: 1px solid #444; text-align: center; ${getResistorStyle(t.wbs_parent)}">${t.wbs_parent}</td>
            <td style="padding: 4px; border: 1px solid #444; text-align: center; ${getResistorStyle(t.wbs_child)}">${t.wbs_child}</td>
            <td style="padding: 4px; border: 1px solid #444; text-align: center; ${getResistorStyle(t.wbs_sibling)}">${t.wbs_sibling}</td>
            <td style="padding: 8px; border: 1px solid #444; text-align: left; padding-left: ${t.depth * 15 + 10}px;">${t.name}</td>
            <td style="padding: 6px; border: 1px solid #444; text-align: center;">${t.calculatedStart}</td>
            <td style="padding: 6px; border: 1px solid #444; text-align: center;">${t.calculatedEnd}</td>
            <td style="padding: 6px; border: 1px solid #444; text-align: center;">${t.progress || 0}%</td>
            <td style="padding: 6px; border: 1px solid #444; text-align: center;">${t.dependency || ''}</td>
        </tr>`;
    });

    h += `</tbody></table>`;

    if (projectData.milestones && projectData.milestones.length > 0) {
        h += `<h3 style="margin-top: 30px; color: #4a9eff; font-size: 1.1em; border-bottom: 1px solid #333; padding-bottom: 5px;">Project Milestones</h3>
        <table style="width:100%; border-collapse: collapse; color: #ccc; font-size: 0.85em; background: #1a1c1e; margin-top: 10px;">
            <thead>
                <tr style="background: #242629;">
                    <th style="padding: 8px; border: 1px solid #444; text-align: left;">Milestone Name</th>
                    <th style="width: 150px; padding: 8px; border: 1px solid #444;">Date</th>
                </tr>
            </thead>
            <tbody>`;
        
        projectData.milestones.forEach(m => {
            h += `<tr style="border-bottom: 1px solid #333;">
                <td style="padding: 8px; border: 1px solid #444; text-align: left;">${m.name}</td>
                <td style="padding: 6px; border: 1px solid #444; text-align: center;">${m.date}</td>
            </tr>`;
        });
        h += `</tbody></table>`;
    }

    container.innerHTML = `<div style="padding: 10px; overflow: auto; height: 100%;">${h}</div>`;
}
