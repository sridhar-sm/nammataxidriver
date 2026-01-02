const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function calculateCalendarDaysSpanned(
  startIso: string | undefined,
  endIso: string | undefined
): number | undefined {
  if (!startIso || !endIso) return undefined;
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return undefined;

  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);

  return Math.max(1, diffDays + 1);
}
