/**
 * Renders established dependency lines between tasks in the Gantt chart.
 */
export function renderDependencyLines(flatTasks, svg, zoomLevel = 70) {
    if (!svg) return;
    
    // Clear existing static lines and their gradients
    const lines = svg.querySelectorAll('path.static-dependency-line');
    lines.forEach(l => l.remove());
    
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.prepend(defs);
    }
    
    // Clear old dependency gradients from defs
    const oldGradients = defs.querySelectorAll('linearGradient.dep-grad');
    oldGradients.forEach(g => g.remove());

    const svgRect = svg.getBoundingClientRect();

    flatTasks.forEach(task => {
        if (task.dependency) {
            const sourceTask = flatTasks.find(ft => ft.fullId === task.dependency);
            const sourceEl = document.querySelector(`.bar[data-id="${task.dependency}"]`);
            const targetEl = document.querySelector(`.bar[data-id="${task.fullId}"]`);

            if (sourceEl && targetEl && sourceTask) {
                const sRect = sourceEl.getBoundingClientRect();
                const tRect = targetEl.getBoundingClientRect();

                const x1 = sRect.right - svgRect.left;
                const y1 = sRect.top + (sRect.height / 2) - svgRect.top;
                const x2 = tRect.left - svgRect.left;
                const y2 = tRect.top + (tRect.height / 2) - svgRect.top;

                // Colors for gradient
                // Start color = Destination (task.resolvedColor)
                // End color = Source (sourceTask.resolvedColor)
                const destColor = task.resolvedColor || '#f4902c';
                const sourceColor = sourceTask.resolvedColor || '#f4902c';

                // Create a unique gradient for this connection
                const gradId = `grad-${task.fullId.replace(/\./g, '-')}-${task.dependency.replace(/\./g, '-')}`;
                const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                grad.id = gradId;
                grad.classList.add('dep-grad');
                grad.setAttribute('gradientUnits', 'userSpaceOnUse');
                grad.setAttribute('x1', x1);
                grad.setAttribute('y1', y1);
                grad.setAttribute('x2', x2);
                grad.setAttribute('y2', y2);

                const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop1.setAttribute('offset', '0%');
                stop1.setAttribute('stop-color', destColor);

                const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop2.setAttribute('offset', '100%');
                stop2.setAttribute('stop-color', sourceColor);

                grad.appendChild(stop1);
                grad.appendChild(stop2);
                defs.appendChild(grad);

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.classList.add('static-dependency-line');
                
                const swoopDistance = zoomLevel * 2;
                const horizontalGap = x2 - x1;
                const curveIntensity = Math.max(swoopDistance, Math.abs(horizontalGap));
                
                const cp1x = x1 + curveIntensity;
                const cp1y = y1;
                const cp2x = x2 - curveIntensity;
                const cp2y = y2;

                const d = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
                
                path.setAttribute('d', d);
                path.setAttribute('stroke', `url(#${gradId})`);
                path.setAttribute('stroke-width', '2.5');
                path.setAttribute('fill', 'none');
                path.setAttribute('marker-end', 'url(#arrowhead)');
                
                svg.appendChild(path);
            }
        }
    });
}
