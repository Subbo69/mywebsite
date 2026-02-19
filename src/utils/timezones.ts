export const timezones = [
  { value: 'UTC-12', label: '(UTC-12:00) International Date Line West' },
  { value: 'UTC-11', label: '(UTC-11:00) Coordinated Universal Time-11' },
  { value: 'UTC-10', label: '(UTC-10:00) Hawaii' },
  { value: 'UTC-9', label: '(UTC-09:00) Alaska' },
  { value: 'UTC-8', label: '(UTC-08:00) Pacific Time (US & Canada)' },
  { value: 'UTC-7', label: '(UTC-07:00) Mountain Time (US & Canada)' },
  { value: 'UTC-6', label: '(UTC-06:00) Central Time (US & Canada)' },
  { value: 'UTC-5', label: '(UTC-05:00) Eastern Time (US & Canada)' },
  { value: 'UTC-4', label: '(UTC-04:00) Atlantic Time (Canada)' },
  { value: 'UTC-3:30', label: '(UTC-03:30) Newfoundland' },
  { value: 'UTC-3', label: '(UTC-03:00) Brasilia, Buenos Aires' },
  { value: 'UTC-2', label: '(UTC-02:00) Mid-Atlantic' },
  { value: 'UTC-1', label: '(UTC-01:00) Azores' },
  { value: 'UTC', label: '(UTC+00:00) UTC, London, Lisbon' },
  { value: 'UTC+1', label: '(UTC+01:00) Central European Time' },
  { value: 'UTC+2', label: '(UTC+02:00) Eastern European Time' },
  { value: 'UTC+3', label: '(UTC+03:00) Moscow, Istanbul' },
  { value: 'UTC+3:30', label: '(UTC+03:30) Tehran' },
  { value: 'UTC+4', label: '(UTC+04:00) Dubai, Baku' },
  { value: 'UTC+4:30', label: '(UTC+04:30) Kabul' },
  { value: 'UTC+5', label: '(UTC+05:00) Pakistan, Tashkent' },
  { value: 'UTC+5:30', label: '(UTC+05:30) India, Sri Lanka' },
  { value: 'UTC+5:45', label: '(UTC+05:45) Kathmandu' },
  { value: 'UTC+6', label: '(UTC+06:00) Bangladesh, Almaty' },
  { value: 'UTC+6:30', label: '(UTC+06:30) Yangon' },
  { value: 'UTC+7', label: '(UTC+07:00) Bangkok, Jakarta' },
  { value: 'UTC+8', label: '(UTC+08:00) Beijing, Singapore' },
  { value: 'UTC+9', label: '(UTC+09:00) Tokyo, Seoul' },
  { value: 'UTC+9:30', label: '(UTC+09:30) Adelaide' },
  { value: 'UTC+10', label: '(UTC+10:00) Sydney, Melbourne' },
  { value: 'UTC+11', label: '(UTC+11:00) Solomon Islands' },
  { value: 'UTC+12', label: '(UTC+12:00) Fiji, Auckland' },
  { value: 'UTC+13', label: '(UTC+13:00) Samoa' },
  { value: 'UTC+14', label: '(UTC+14:00) Line Islands' },
];

export function parseTimezoneOffset(timezone: string): number {
  const match = timezone.match(/UTC([+-])?(\d+)(?::(\d+))?/);
  if (!match) return 0;

  const sign = match[1] === '-' ? -1 : 1;
  const hours = parseInt(match[2]);
  const minutes = match[3] ? parseInt(match[3]) : 0;

  return sign * (hours + minutes / 60);
}

export function convertTimeToTimezone(timeStr: string, fromTimezone: string, toTimezone: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);

  const fromOffset = parseTimezoneOffset(fromTimezone);
  const toOffset = parseTimezoneOffset(toTimezone);
  const offsetDiff = toOffset - fromOffset;

  const totalMinutes = hours * 60 + minutes + (offsetDiff * 60);

  let newHours = Math.floor(totalMinutes / 60);
  let newMinutes = totalMinutes % 60;

  if (newHours >= 24) {
    newHours -= 24;
  } else if (newHours < 0) {
    newHours += 24;
  }

  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}
