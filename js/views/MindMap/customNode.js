import { state } from '../../core/state.js';
import { toggleFold } from '../../Menu/View/toggleFold.js';

export function CustomNode({ data }) {
    const e = React.createElement;
    const { Handle, Position } = window.ReactFlow;
    const { task } = data;
    
    const isFolded = state.foldedIds.has(task.fullId);
    const hasChildren = task.hasChildren;

    const onTriangleClick = (event) => {
        event.stopPropagation();
        toggleFold(task.fullId);
    };

    const triangle = hasChildren 
        ? e('span', { 
            onClick: onTriangleClick,
            style: { 
                cursor: 'pointer', 
                marginRight: '8px',
                display: 'inline-block',
                transform: isFolded ? 'rotate(-90deg)' : 'none',
                transition: 'transform 0.2s ease',
                width: '16px',
                textAlign: 'center'
            } 
          }, '▼')
        : e('span', { style: { width: '24px', display: 'inline-block' } }); // Spacer

    return e(React.Fragment, null,
        e(Handle, { type: 'target', position: Position.Left, style: { background: '#555' } }),
        e('div', { style: { display: 'flex', alignItems: 'center', width: '100%', height: '100%' } },
            triangle,
            e('div', { style: { flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, task.name)
        ),
        e(Handle, { type: 'source', position: Position.Right, style: { background: '#555' } })
    );
}