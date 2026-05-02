export function getSeason(date) {
    const month = date.getMonth();
    const day = date.getDate();
    // Canadian Seasons (Astronomical start dates)
    // Spring: March 20, Summer: June 21, Fall: Sept 22, Winter: Dec 21
    if ((month === 2 && day >= 20) || (month > 2 && month < 5) || (month === 5 && day < 21)) {
        return "Spring";
    } else if ((month === 5 && day >= 21) || (month > 5 && month < 8) || (month === 8 && day < 22)) {
        return "Summer";
    } else if ((month === 8 && day >= 22) || (month > 8 && month < 11) || (month === 11 && day < 21)) {
        return "Fall";
    } else {
        return "Winter";
    }
}
