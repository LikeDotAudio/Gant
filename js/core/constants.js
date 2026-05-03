/**
 * js/core/constants.js
 * Central repository for all "magic numbers" and configuration constants used throughout the application.
 */

export const TIME = {
    MILLISECONDS_PER_DAY: 86400000,
    DAYS_PER_WEEK: 7,
    MONTHS_PER_YEAR: 12
};

export const Z_INDEX = {
    TIMELINE_HEADER: 100,
    DEPENDENCY_SVG: 145,
    DECORATIONS: 150,
    TODAY_LINE: 150,
    HOVER_LINE: 151,
    GANTT_ROW_STICKY: 200,
    NAVIGATOR: 2000,
    OVERLAY_SHIELD: 1000,
    BLOB_IMPORT_OVERLAY: 3000
};

export const LAYOUT = {
    DEFAULT_ROW_HEIGHT_PX: 24,
    HEADER_HEIGHT_PX: 108,
    MIN_BAR_WIDTH_PX: 5,
    BAR_HEIGHTS: {
        ROOT: 10,
        PARENT: 15,
        CHILD: 18,
        SIBLING: 20
    },
    BAR_TOP_OFFSETS: {
        ROOT: 7,
        PARENT: 4,
        CHILD: 3,
        SIBLING: 2
    }
};

export const COLORS = {
    DEFAULT_TASK: '#f4902c',
    ACCENT: '#f4902c',
    DEPENDENCY_LINE: '#ff4a4a',
    MILESTONE: '#ff4a4a',
    TODAY_LINE: '#ff4a4a'
};

export const DEPTH = {
    ROOT: 0,
    PARENT: 1,
    CHILD: 2,
    SIBLING: 3
};
