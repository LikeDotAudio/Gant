/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/timeline functionality.
 */

export function getStickyWidthPx() {
    const root = document.documentElement;
    const cols = ['root', 'parent', 'child', 'sibling', 'color', 'dep', 'name', 'prog', 'start', 'end', 'dur'];
    let total = 0;
    cols.forEach(c => {
        const val = getComputedStyle(root).getPropertyValue(`--${c}-w`);
        total += parseFloat(val) || 0;
    });
    return total;
}
