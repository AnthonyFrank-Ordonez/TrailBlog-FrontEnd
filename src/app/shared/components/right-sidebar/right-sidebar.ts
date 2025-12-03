import { Component, computed, inject } from '@angular/core';
import { RecentViewedPost } from './recent-viewed-post/recent-viewed-post';
import { ManageCommunitiesBar } from './manage-communities-bar/manage-communities-bar';
import { AuthService } from '@core/services/auth.service';
import { RightSidebarConfig } from '@core/models/interface/pages';
import { MostPopularPosts } from './most-popular-posts/most-popular-posts';
import { CurrentRouteService } from '@core/services/current-route.service';

@Component({
  selector: 'app-right-sidebar',
  imports: [RecentViewedPost, ManageCommunitiesBar, MostPopularPosts],
  templateUrl: './right-sidebar.html',
  styleUrl: './right-sidebar.css',
})
export class RightSidebar {
  private authService = inject(AuthService);
  private currentRouteService = inject(CurrentRouteService);
  private readonly rightSidebarConfig: Record<string, RightSidebarConfig> = {
    '/': { component: 'recent-viewed', requiresAuth: true },
    '/popular': { component: 'recent-viewed', requiresAuth: true },
    '/communities': { component: 'manage-community', requiresAuth: true },
    '/explore': { component: 'recent-viewed', requiresAuth: true },
  };

  currentPath = this.currentRouteService.currentPath;
  isAuthenticated = this.authService.isAuthenticated;

  sideBarComponent = computed(() => {
    const path = this.currentPath();
    const config = this.rightSidebarConfig[path];

    if (!config) return null;
    if (config.requiresAuth && !this.isAuthenticated()) return null;

    return config.component;
  });
}
