export function formatDate(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const datePart = d.toISOString().split('T')[0];
    const hours = d.getHours();
    const mins = d.getMinutes();
    if (hours === 0 && mins === 0) return datePart;
    return `${datePart} ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
