export function toggleCol(col, checked) {
    const workspace = document.getElementById('workspace');
    if (checked) workspace.classList.remove(`hide-${col}`);
    else workspace.classList.add(`hide-${col}`);
}
