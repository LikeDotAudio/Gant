import * as columns from '../../columns/index.js';

const { manager: cols } = columns;

export function toggleCol(col, checked) { 
    cols.toggleCol(col, checked); 
}
