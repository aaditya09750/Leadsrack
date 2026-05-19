interface RelativeTimeOffset {
  minutesAgo?: number;
  hoursAgo?: number;
  daysAgo?: number;
}

function formatFromMs(ms: number): string {
  const min = Math.floor(ms / 60_000);
  const hr = Math.floor(ms / 3_600_000);
  const day = Math.floor(ms / 86_400_000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  if (day === 1) return 'Yesterday';
  return `${day} days ago`;
}

export function formatRelativeTime(input: string | Date | RelativeTimeOffset): string {
  if (typeof input === 'string' || input instanceof Date) {
    const ms = Date.now() - new Date(input).getTime();
    return formatFromMs(ms);
  }
  const ms =
    (input.minutesAgo ?? 0) * 60_000 +
    (input.hoursAgo ?? 0) * 3_600_000 +
    (input.daysAgo ?? 0) * 86_400_000;
  return formatFromMs(ms);
}
