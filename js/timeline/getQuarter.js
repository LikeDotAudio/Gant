import { log } from '../utils/logger.js';

export function getQuarter(date) {
    log("getQuarter", "Getting the quarter for a given date", { date });
    const month = date.getMonth();
    if (month < 3) return "Q1";
    if (month < 6) return "Q2";
    if (month < 9) return "Q3";
    return "Q4";
}
