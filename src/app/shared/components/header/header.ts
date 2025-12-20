import { Component, DestroyRef, HostListener, inject, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { handleHttpError } from '@shared/utils/utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { AuthService } from '@core/services/auth.service';
import { MessageService } from '@core/services/message.service';
import { UserService } from '@core/services/user.service';
import { tap } from 'rxjs';
import { PostService } from '@core/services/post.service';
import { CommunityService } from '@core/services/community.service';
import { Tooltip } from '../tooltip/tooltip';
import { NgOptimizedImage } from '@angular/common';
import { CurrentRouteService } from '@core/services/current-route.service';
import { ModalService } from '@core/services/modal.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, InitialsPipe, Tooltip, NgOptimizedImage],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private userService = inject(UserService);
  private postService = inject(PostService);
  private communityService = inject(CommunityService);
  private currentRouteService = inject(CurrentRouteService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isAuthenticated = this.authService.isAuthenticated;
  user = this.userService.user;
  activeTab = this.userService.activeUserTab;

  hideHeader = false;
  hideBottomNav = false;
  scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  lastScrollTop = 0;

  profileMenuMap = new Map<string, () => void>([
    ['signout', () => this.onSignOut()],
    ['drafts', () => this.onDrafts()],
    ['archives', () => this.onArchives()],
  ]);

  readonly profileMenuItems = [
    {
      label: 'Profile',
      iconClass: 'icon-tabler-user',
      svgPath: [
        'M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z',
        'M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z',
      ],
      action: 'profile',
      fill: true,
    },
    {
      label: 'Drafts',
      iconClass: 'icon-tabler-clipboard-text',
      svgPath: [
        'M17.997 4.17a3 3 0 0 1 2.003 2.83v12a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 2.003 -2.83a4 4 0 0 0 3.997 3.83h4a4 4 0 0 0 3.98 -3.597zm-2.997 10.83h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m0 -4h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m-1 -9a2 2 0 1 1 0 4h-4a2 2 0 1 1 0 -4z',
      ],
      action: 'drafts',
      fill: true,
    },
    {
      label: 'Archives',
      iconClass: 'icon-tabler-archive',
      svgPath: [
        'M2 3m0 2a2 2 0 0 1 2 -2h16a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-16a2 2 0 0 1 -2 -2z',
        'M19 9c.513 0 .936 .463 .993 1.06l.007 .14v7.2c0 1.917 -1.249 3.484 -2.824 3.594l-.176 .006h-10c-1.598 0 -2.904 -1.499 -2.995 -3.388l-.005 -.212v-7.2c0 -.663 .448 -1.2 1 -1.2h14zm-5 2h-4l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h4l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z',
      ],
      action: 'archives',
      fill: true,
    },
    {
      label: 'Settings',
      iconClass: 'icon-tabler-settings',
      svgPath: [
        'M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z',
      ],
      action: 'settings',
      fill: true,
    },
    {
      label: 'Sign out',
      iconClass: 'icon-tabler-logout-2',
      svgPath: [
        'M10 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2',
        'M15 12h-12l3 -3',
        'M6 15l-3 -3',
      ],
      action: 'signout',
      fill: false,
    },
  ];

  ngOnDestroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  toggleProfileMenu(action: string) {
    const handler = this.profileMenuMap.get(action);

    if (handler && action === 'signout') {
      return this.modalService.openModal({
        type: 'generic',
        title: 'Sign out',
        description: 'Are you sure you want to sign out?',
        content: 'confirmation-modal',
        subcontent:
          'Are you sure you want to sign out? Please save your work before signing out, or you will lose all your work.',
        confirmBtnText: 'Sign out',
        cancelBtnText: 'Cancel',
        onConfirm: () => this.onSignOut(),
      });
    }

    if (handler) {
      handler();
    }
  }

  onSignOut() {
    this.authService
      .logout()
      .pipe(
        tap(() => {
          this.clearServiceData();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  onDrafts() {
    this.currentRouteService.handleRedirection(['drafts']);
  }

  onArchives() {
    this.currentRouteService.handleRedirection(['archives']);
  }

  onSearch(query: string) {
    this.postService.enteredSearchQuery.set(query);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Hide headers when scrolling down, show when scrolling up
    if (scrollTop > this.lastScrollTop && scrollTop > 100) {
      // Scrolling down
      this.hideHeader = true;
      this.hideBottomNav = true;
    } else if (scrollTop < this.lastScrollTop) {
      // Scrolling up
      this.hideHeader = false;
      this.hideBottomNav = false;
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling

    // Show headers again after user stops scrolling
    this.scrollTimeout = setTimeout(() => {
      this.hideHeader = false;
      this.hideBottomNav = false;
    }, 1000); // Show after 1 second of no scrolling
  }

  private clearServiceData() {
    this.postService.resetPostServiceData();
    this.communityService.resetCommunityServiceData();
  }
}
