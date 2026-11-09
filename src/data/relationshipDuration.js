export function formatRelationshipDuration(startDate, today = new Date()) {
  const [year, month, day] = startDate.split('-').map(Number);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const beforeAnniversary = today.getDate() < Math.min(day, daysInMonth);
  const months = Math.max(0, (currentYear - year) * 12 + currentMonth + 1 - month - Number(beforeAnniversary));
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const parts = [];
  if (years) parts.push(`${years} năm`);
  if (remainingMonths || !years) parts.push(`${remainingMonths} tháng`);
  return parts.join(' ');
}
