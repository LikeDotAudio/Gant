export function getResistorClass(val) {
    const num = parseInt(val);
    if (isNaN(num) || num < 0 || num > 9) return 'res-none';
    return `res-${num} res-cell`;
}
