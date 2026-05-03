import { state } from '../../core/state.js';

export function rowDragStart(e, fullId) { 
    state.draggedRowFullId = fullId; 
    e.target.classList.add('dragging'); 
}
