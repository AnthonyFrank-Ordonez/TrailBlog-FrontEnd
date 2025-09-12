import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-side-navigation',
  imports: [],
  templateUrl: './side-navigation.html',
  styleUrl: './side-navigation.css',
})
export class SideNavigation {
  activeTab = signal<string>('home');
}
