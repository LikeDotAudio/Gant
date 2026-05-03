import * as gantt from '../Rows/index.js';
import { getContrastColor } from '../progressbar/getContrastColor.js';

export function renderMindMap(projectData, container, cachedFlat = null) {
    if (!container) return;
    
    // Safety check in case the CDNs failed to load or the app went offline
    if (!window.React || !window.ReactFlow) {
        container.innerHTML = '<div style="color:red; padding:20px;">ReactFlow dependencies are not loaded.</div>';
        return;
    }

    // Leverage your existing tree flattener to extract hierarchy and depth
    const flat = cachedFlat || gantt.flattenTasks(projectData.roots, 0, "", {
        baseDate: projectData.baseDate
    });

    const nodes = [];
    const edges = [];

    // Track root indices and counts for columnar layout
    const rootMap = new Map(); // Maps wbs_root -> { index, count }
    let rootCounter = 0;

    // Map your flattened tasks into React Flow nodes
    flat.forEach((t) => {
        const rootId = t.wbs_root || 'default';
        if (!rootMap.has(rootId)) {
            rootMap.set(rootId, { index: rootCounter++, count: 0 });
        }
        const rootInfo = rootMap.get(rootId);
        const relativeY = rootInfo.count++;

        const bg = t.resolvedColor || '#242629';
        const color = getContrastColor(bg);

        nodes.push({
            id: t.fullId,
            data: { label: t.name },
            // Columnar layout: 
            // - Each root gets its own starting X column (root index * 600)
            // - Within a root, indentation increases X (depth * 250)
            // - Y is sequential within that root's column
            position: { 
                x: (rootInfo.index * 600) + (t.depth * 250), 
                y: relativeY * 70 
            },
            sourcePosition: 'right',
            targetPosition: 'left',
            style: {
                background: bg,
                color: color,
                border: '1px solid #444',
                borderRadius: '6px',
                padding: '10px 15px',
                fontSize: '12px',
                fontWeight: 'bold',
                width: 220,
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }
        });

        // Draw an edge if the current task has a parent
        if (t.depth > 0) {
            const parentId = t.fullId.split('.').slice(0, -1).join('.');
            edges.push({
                id: `e-${parentId}-${t.fullId}`,
                source: parentId,
                target: t.fullId,
                type: 'smoothstep', // Gives a nice curved elbow look
                animated: false,
                style: { stroke: '#888', strokeWidth: 2 }
            });
        }
    });

    const e = React.createElement;
    const { ReactFlow, Controls, Background, MiniMap } = window.ReactFlow;

    // Build the React component completely using Vanilla JS
    const FlowComponent = () => {
        return e('div', { style: { width: '100%', height: '100%', background: '#1a1c1e' } },
            e(ReactFlow, {
                nodes: nodes,
                edges: edges,
                fitView: true,
                nodesConnectable: false, // Make it a read-only visualizer
                nodesDraggable: true,
                elementsSelectable: true
            },
            e(Controls, { style: { background: '#3e444a', fill: '#fff', border: 'none' } }),
            e(Background, { color: '#333', gap: 16 }),
            e(MiniMap, { 
                nodeColor: (n) => n.style.background, 
                maskColor: 'rgba(0,0,0,0.4)',
                style: { background: '#242629' }
            })
            )
        );
    };

    // Initialize or re-use the React root bound to this container
    if (!container._reactRoot) {
        container._reactRoot = ReactDOM.createRoot(container);
    }
    container._reactRoot.render(e(FlowComponent));
}