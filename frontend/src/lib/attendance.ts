export function getWorkingDaysInMonth(month: string): string[] {
  const [year, m] = month.split('-').map(Number);
  const days: string[] = [];
  const cursor = new Date(year, m - 1, 1);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  while (cursor.getMonth() === m - 1) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      days.push(dateStr);
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return days.filter(d => d <= today);
}

export function getStatus(time: string | null): string {
  if (!time) return 'Absent';
  const [h, m] = time.split(':').map(Number);
  return h < 9 || (h === 9 && m === 0) ? 'On time' : 'Late';
}

export function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}