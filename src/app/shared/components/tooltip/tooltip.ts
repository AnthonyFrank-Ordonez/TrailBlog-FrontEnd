import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

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
}
