/**
 * Draws a temporary connection line from the source task to the current mouse position.
 */
export function drawDependencyLine(e, sourceId, svg) {
    const sourceEl = document.querySelector(`.bar[data-id="${sourceId}"]`);
    if (!sourceEl) return;

    const svgRect = svg.getBoundingClientRect();
    const sourceRect = sourceEl.getBoundingClientRect();

    const x1 = sourceRect.right - svgRect.left;
    const y1 = sourceRect.top + (sourceRect.height / 2) - svgRect.top;
    const x2 = e.clientX - svgRect.left;
    const y2 = e.clientY - svgRect.top;

    let tempLine = svg.querySelector('#temp-dependency-line');
    if (!tempLine) {
        tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tempLine.id = 'temp-dependency-line';
        tempLine.setAttribute('stroke', '#ff4a4a');
        tempLine.setAttribute('stroke-width', '2');
        tempLine.setAttribute('stroke-dasharray', '4');
        svg.appendChild(tempLine);
    }

    tempLine.setAttribute('x1', x1);
    tempLine.setAttribute('y1', y1);
    tempLine.setAttribute('x2', x2);
    tempLine.setAttribute('y2', y2);
}
