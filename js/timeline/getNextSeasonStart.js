export function getNextSeasonStart(date) {
    const year = date.getFullYear();
    const spring = new Date(year, 2, 20);
    const summer = new Date(year, 5, 21);
    const fall = new Date(year, 8, 22);
    const winter = new Date(year, 11, 21);
    const nextYearSpring = new Date(year + 1, 2, 20);

    if (date < spring) return spring;
    if (date < summer) return summer;
    if (date < fall) return fall;
    if (date < winter) return winter;
    return nextYearSpring;
}
