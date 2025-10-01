import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-side-navigation',
  imports: [],
  templateUrl: './side-navigation.html',
  styleUrl: './side-navigation.css',
  animations: [],
})
export class SideNavigation {
  activeTab = signal<string>('home');
  isCommunitiesExpanded = signal<boolean>(true);

  toggleCommunities() {
    this.isCommunitiesExpanded.update((value) => !value);
  }
}
