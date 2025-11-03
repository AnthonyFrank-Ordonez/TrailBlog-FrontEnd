import { Component, computed, inject, Signal } from '@angular/core';
import { RecentViewedPost } from './recent-viewed-post/recent-viewed-post';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith, tap } from 'rxjs';
import { ManageCommunitiesBar } from './manage-communities-bar/manage-communities-bar';
import { AuthService } from '@core/services/auth.service';
import { RightSidebarConfig } from '@core/models/interface/pages';
import { MostPopularPosts } from './most-popular-posts/most-popular-posts';

@Component({
  selector: 'app-right-sidebar',
  imports: [RecentViewedPost, ManageCommunitiesBar, MostPopularPosts],
  templateUrl: './right-sidebar.html',
  styleUrl: './right-sidebar.css',
})
export class RightSidebar {
  private authService = inject(AuthService);
  private readonly rightSidebarConfig: Record<string, RightSidebarConfig> = {
    '/': { component: 'recent-viewed', requiresAuth: true },
    '/popular': { component: 'recent-viewed', requiresAuth: true },
    '/communities': { component: 'manage-community', requiresAuth: true },
  };

  currentPath: Signal<string>;
  isAuthenticated = this.authService.isAuthenticated;

  constructor(private router: Router) {
    this.currentPath = toSignal(
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.url),
        startWith(this.router.url),
      ),
      { initialValue: this.router.url },
    );
  }

  sideBarComponent = computed(() => {
    const path = this.currentPath();
    const config = this.rightSidebarConfig[path];

    if (!config) return null;
    if (config.requiresAuth && !this.isAuthenticated()) return null;

    return config.component;
  });
}
