import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true,
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined, maxInitials: number = 2): string {
    if (!value) return '';

    const words = value
      .replace(/[-./_]/g, ' ') // Special Characters
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Finds lowercase followed by uppercase
      .trim()
      .split(/\s+/) // white spaces
      .filter((word) => word.length > 0);

    if (words.length === 0) return '';

    if (words.length === 1) {
      const word = words[0];

      const capitals = word.match(/[A-Z]/g);
      if (capitals && capitals.length >= 2) {
        return capitals.slice(0, maxInitials).join('');
      }

      return word.slice(0, Math.min(maxInitials, word.length)).toUpperCase();
    }

    return words
      .slice(0, maxInitials)
      .map((word) => word[0].toUpperCase())
      .join('');
  }
}
