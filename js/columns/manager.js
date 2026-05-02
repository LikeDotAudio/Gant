/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/columns functionality.
 */

export function toggleCol(col, checked) {
    const workspace = document.getElementById('workspace');
    if (checked) workspace.classList.remove(`hide-${col}`);
    else workspace.classList.add(`hide-${col}`);
}
