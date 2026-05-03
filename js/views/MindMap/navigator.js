import { handleNodeDoubleClick } from './EditEvent.js';
import { handleConnect, handleEdgesDelete, handleNodesDelete } from './events.js';

/**
 * Navigator component for the Mind Map.
 * Wraps ReactFlow with Controls, Background, and MiniMap.
 */
export function createFlowComponent(nodes, edges) {
    const e = React.createElement;
    const { ReactFlow, Controls, Background, MiniMap } = window.ReactFlow;

    return () => {
        return e('div', { style: { width: '100%', height: '100%', background: '#1a1c1e' } },
            e(ReactFlow, {
                nodes: nodes,
                edges: edges,
                fitView: true,
                nodesConnectable: true,
                nodesDraggable: true,
                elementsSelectable: true,
                onNodeDoubleClick: handleNodeDoubleClick,
                onConnect: handleConnect,
                onEdgesDelete: handleEdgesDelete,
                onNodesDelete: handleNodesDelete,
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
}
