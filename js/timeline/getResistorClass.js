/**
 * GANTT software is free to use and copy as needed.
 * Purpose: Provides functionality related to js/timeline functionality.
 */

export function getResistorClass(val) {
    const num = parseInt(val);
    if (isNaN(num) || num < 0 || num > 9) return 'res-none';
    return `res-${num} res-cell`;
}
