import { getContrastColor } from '../../progressbar/getContrastColor.js';

/**
 * Generates the hierarchical coloring and visual style for Mind Map nodes.
 * @param {Object} task - The flattened task object.
 * @returns {Object} ReactFlow style object.
 */
export function getNodeStyle(task) {
    const bg = task.resolvedColor || '#242629';
    const color = getContrastColor(bg);

    return {
        background: bg,
        color: color,
        border: '1px solid #444',
        borderRadius: '8px',
        padding: '12px 20px',
        fontSize: '13px',
        fontWeight: 'bold',
        width: 250,
        boxShadow: '0 6px 12px rgba(0,0,0,0.4)'
    };
}
