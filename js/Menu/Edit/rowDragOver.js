export function rowDragOver(e) { 
    e.preventDefault(); 
    const row = e.target.closest('.gantt-row'); 
    if (row) row.classList.add('drag-over'); 
}
