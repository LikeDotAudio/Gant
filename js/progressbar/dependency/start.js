import { state } from '../../core/state.js';
import { drawDependencyLine } from './draw.js';
import { completeDependencyConnection } from './complete.js';

/**
 * Initiates the dependency dragging process.
 */
export function startDependencyDrag(e, sourceId) {
    e.stopPropagation();
    state.dependencyDragSource = sourceId;
    
    const svg = document.getElementById('dependency-svg');
    if (!svg) return;

    const handleMouseMove = (me) => {
        drawDependencyLine(me, sourceId, svg);
    };

    const handleMouseUp = (me) => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        completeDependencyConnection(me, sourceId, svg);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
}
