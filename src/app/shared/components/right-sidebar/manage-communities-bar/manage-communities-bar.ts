import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-manage-communities-bar',
  imports: [NgClass],
  templateUrl: './manage-communities-bar.html',
  styleUrl: './manage-communities-bar.css',
})
export class ManageCommunitiesBar {
  activeButton = signal<string>('all');
}
