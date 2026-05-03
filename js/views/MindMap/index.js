import * as gantt from '../../Rows/index.js';
import { buildTree } from './builder.js';
import { createFlowComponent } from './navigator.js';

/**
 * Main entry point for rendering the Mind Map view.
 * Refactored into modular components for tree building, coloring, and navigation.
 */
export function renderMindMap(projectData, container, cachedFlat = null) {
    if (!container) return;
    
    // Safety check for dependencies
    if (!window.React || !window.ReactFlow) {
        container.innerHTML = '<div style="color:red; padding:20px;">ReactFlow dependencies are not loaded.</div>';
        return;
    }

    // 1. Prepare flattened data
    const flat = cachedFlat || gantt.flattenTasks(projectData.roots, 0, "", {
        baseDate: projectData.baseDate
    });

    // 2. Build the tree (Nodes and Edges) - See builder.js
    const { nodes, edges } = buildTree(flat);

    // 3. Create the Flow component - See navigator.js
    const FlowComponent = createFlowComponent(nodes, edges);

    // 4. Render to the DOM
    if (!container._reactRoot) {
        container._reactRoot = ReactDOM.createRoot(container);
    }
    
    const e = React.createElement;
    container._reactRoot.render(e(FlowComponent));
}
