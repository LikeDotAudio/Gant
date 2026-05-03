import { getNodeStyle } from './styles.js';

/**
 * Builds the tree structure (nodes and edges) for ReactFlow.
 * @param {Array} flatTasks - Flattened project tasks.
 * @returns {Object} { nodes, edges }
 */
export function buildTree(flatTasks) {
    const nodes = [];
    const edges = [];

    // Track root indices and counts for columnar layout
    const rootMap = new Map(); // Maps wbs_root -> { index, count }
    let rootCounter = 0;

    flatTasks.forEach((t) => {
        const rootId = t.wbs_root || 'default';
        if (!rootMap.has(rootId)) {
            rootMap.set(rootId, { index: rootCounter++, count: 0 });
        }
        const rootInfo = rootMap.get(rootId);
        const relativeY = rootInfo.count++;

        // Dynamic horizontal spacing:
        // - Roots are spaced far apart (1000px)
        // - Indentation is 350px per level
        const xPos = (rootInfo.index * 1000) + (t.depth * 350);

        nodes.push({
            id: t.fullId,
            data: { label: t.name },
            position: { 
                x: xPos, 
                y: relativeY * 85 
            },
            sourcePosition: 'right',
            targetPosition: 'left',
            style: getNodeStyle(t)
        });

        // Draw an edge if the current task has a parent
        if (t.depth > 0) {
            const parentId = t.fullId.split('.').slice(0, -1).join('.');
            edges.push({
                id: `e-${parentId}-${t.fullId}`,
                source: parentId,
                target: t.fullId,
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#888', strokeWidth: 2 }
            });
        }
    });

    return { nodes, edges };
}
