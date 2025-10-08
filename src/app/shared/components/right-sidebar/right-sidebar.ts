import { Component, Signal } from '@angular/core';
import { RecentViewedPost } from './recent-viewed-post/recent-viewed-post';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith, tap } from 'rxjs';
import { ManageCommunitiesBar } from './manage-communities-bar/manage-communities-bar';

@Component({
  selector: 'app-right-sidebar',
  imports: [RecentViewedPost, ManageCommunitiesBar],
  templateUrl: './right-sidebar.html',
  styleUrl: './right-sidebar.css',
})
export class RightSidebar {
  currentPath: Signal<string>;

  constructor(private router: Router) {
    this.currentPath = toSignal(
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        tap((event) => console.log('Route changes: ', event.url)),
        map((event: NavigationEnd) => event.url),
        startWith(this.router.url),
      ),
      { initialValue: this.router.url },
    );
  }
}
