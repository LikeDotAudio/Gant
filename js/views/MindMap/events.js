import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { moveItem } from '../../Rows/moveItem.js';
import { confirmDeleteSelected } from '../../Menu/Edit/confirmDeleteSelected.js';
import { findParentAndIndex } from '../../Rows/findParentAndIndex.js';
import { refreshIds } from '../../Rows/refreshIds.js';
import { undoManager } from '../../Undo/manager.js';

/**
 * Handles the creation of a new connection between two nodes.
 * This represents moving a task to be a child of another task.
 * @param {object} connection - The connection object from ReactFlow.
 */
export function handleConnect(connection) {
  const { source, target } = connection;

  // Prevent a task from being its own parent
  if (source === target) return;

  undoManager.pushState();
  // Move the target task to be a child of the source task
  const moved = moveItem(state.projectData.roots, target, source, 'into');

  if (moved) {
    refreshIds(state.projectData.roots);
    // If the move was successful, trigger a full re-render
    render(true);
  }
}

/**
 * Handles the deletion of edges.
 * For now, this is disabled to prevent accidental data loss.
 * @param {Array} edgesToRemove - The edges to be removed.
 */
export function handleEdgesDelete(edgesToRemove) {
  console.log('Edge deletion is currently disabled.', edgesToRemove);
  // Future implementation would require deciding what happens to the child task.
  // For example, make it a root task.
}

/**
 * Handles the deletion of nodes.
 * Intercepts ReactFlow's deletion and routes to central deletion manager.
 * @param {Array} nodesToRemove - The nodes to be removed.
 */
export function handleNodesDelete(nodesToRemove) {
  if (nodesToRemove && nodesToRemove.length > 0) {
      const fullId = nodesToRemove[0].id;
      state.selectedTaskFullIds.clear();
      state.selectedTaskFullIds.add(fullId);
      
      // Force a re-render to revert the optimistic UI deletion by ReactFlow
      // ReactFlow might have hidden the node locally, re-rendering with our unchanged projectData puts it back
      render(true); 

      // Trigger the safe confirmation prompt
      confirmDeleteSelected();
  }
}

/**
 * Handles node drag stop to reorder siblings.
 * @param {Event} event 
 * @param {Object} draggedNode 
 * @param {Array} currentNodes 
 */
export function handleNodeDragStop(event, draggedNode, currentNodes) {
    const fullId = draggedNode.id;
    const parentFullId = fullId.includes('.') ? fullId.substring(0, fullId.lastIndexOf('.')) : '';

    // Create an updated list of siblings with the new position for the dragged node
    const siblings = currentNodes
        .map(n => n.id === fullId ? draggedNode : n)
        .filter(n => {
            const nParentFullId = n.id.includes('.') ? n.id.substring(0, n.id.lastIndexOf('.')) : '';
            return nParentFullId === parentFullId;
        });

    // Sort siblings by their current Y position
    siblings.sort((a, b) => a.position.y - b.position.y);

    // Find the new index of our dragged node
    const newIndex = siblings.findIndex(n => n.id === fullId);

    const { parent: stateParent, index: oldIndex } = findParentAndIndex(state.projectData.roots, fullId);
    
    if (stateParent && oldIndex !== newIndex && newIndex !== -1) {
        undoManager.pushState();
        // Remove from old position
        const [taskToMove] = stateParent.children.splice(oldIndex, 1);
        // Insert at new position
        stateParent.children.splice(newIndex, 0, taskToMove);
        refreshIds(state.projectData.roots);
        render(true);
    } else {
        // If it didn't change order, just re-render to snap it back to its grid position
        render(true);
    }
}
