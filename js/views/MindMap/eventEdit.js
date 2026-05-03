/**
 * Handles the double-click event on a node in the Mind Map view.
 * Initiates the editing mode for the task associated with the node.
 *
 * @param {Event} event - The mouse event.
 * @param {object} node - The clicked node from ReactFlow.
 */
export function handleNodeDoubleClick(event, node) {
  if (node && node.id) {
    if (window.app && typeof window.app.editTask === 'function') {
      window.app.editTask(node.id);
    }
  }
}
