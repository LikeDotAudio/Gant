export const RESISTOR_COLORS = [
    "#000000", // 0: Black
    "#5d4037", // 1: Brown
    "#ff0000", // 2: Red
    "#ff9800", // 3: Orange
    "#ffff00", // 4: Yellow
    "#00ff00", // 5: Green
    "#2196f3", // 6: Blue
    "#9c27b0", // 7: Violet
    "#9e9e9e", // 8: Grey
    "#ffffff"  // 9: White
];

/**
 * Resolves the color for a task based on its specific color, inherited color, or WBS ID.
 */
export function resolveTaskColor(task, depth, tid, inheritedColor = null) {
    const idVal = parseInt(tid);
    const resistorColor = !isNaN(idVal) ? RESISTOR_COLORS[idVal % 10] : RESISTOR_COLORS[(depth + 1) % 10];
    return task.color || inheritedColor || resistorColor;
}
