import { NgClass } from '@angular/common';
import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  imports: [NgClass],
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
})
export class Tooltip {
  toolTipText = input.required<string>();
  baseTooltipClass = input<string>();
  toolTipClass = input<string>();
  isHoverable = input<boolean>(false);

  isHidden = signal<boolean>(false);

  getTooltipClass() {
    const baseClass = `absolute left-1/2 -translate-x-1/2   transition-all duration-200 ${this.isHoverable() ? '' : 'pointer-events-none'}`;

    if (this.isHidden()) {
      return `${baseClass} opacity-0 invisible`;
    }

    return `${baseClass} opacity-0 invisible group-hover:opacity-100 group-hover:visible`;
  }

  onMouseEnter() {
    this.isHidden.set(false);
  }

  onContentClick() {
    this.isHidden.set(true);
  }
}
