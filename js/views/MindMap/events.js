import { state } from '../../core/state.js';
import { render } from '../../core/render.js';
import { moveItem } from '../../Rows/moveItem.js';

/**
 * Handles the creation of a new connection between two nodes.
 * This represents moving a task to be a child of another task.
 * @param {object} connection - The connection object from ReactFlow.
 */
export function handleConnect(connection) {
  const { source, target } = connection;

  // Prevent a task from being its own parent
  if (source === target) return;

  // Move the target task to be a child of the source task
  const moved = moveItem(state.projectData.roots, target, source, 'into');

  if (moved) {
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
 * This is disabled to prevent accidental data loss.
 * @param {Array} nodesToRemove - The nodes to be removed.
 */
export function handleNodesDelete(nodesToRemove) {
  console.log('Node deletion is currently disabled.', nodesToRemove);
  // This would be equivalent to deleting a task, which is a destructive action.
}
