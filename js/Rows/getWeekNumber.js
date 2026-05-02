export function getWeekNumber(d) { 
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); 
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7)); 
    return Math.ceil((( (d - new Date(Date.UTC(d.getUTCFullYear(),0,1))) / 86400000) + 1)/7); 
}
