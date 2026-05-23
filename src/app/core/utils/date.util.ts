export function getUtcTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isUtcToday(dateStr: string): boolean {
  return dateStr === getUtcTodayString();
}
