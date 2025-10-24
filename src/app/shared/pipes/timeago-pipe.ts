import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeago',
})
export class TimeagoPipe implements PipeTransform {
  transform(value: string | Date | number | undefined): string {
    if (!value) return 'just now';

    const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);

    if (seconds < 0) return 'just now';

    const years = Math.floor(seconds / 31536000);
    if (years >= 1) return this.format(years, 'year');

    const months = Math.floor(seconds / 2592000);
    if (months >= 1) return this.format(months, 'month');

    const days = Math.floor(seconds / 86400);
    if (days >= 1) return this.format(days, 'day');

    const hours = Math.floor(seconds / 3600);
    if (hours >= 1) return this.format(hours, 'hour');

    const minutes = Math.floor(seconds / 60);
    if (minutes >= 1) return this.format(minutes, 'minute');

    return seconds >= 1 ? this.format(seconds, 'second') : 'just now';
  }

  private format(count: number, label: string): string {
    return count === 1 ? `1 ${label} ago` : `${count} ${label}s ago`;
  }
}
