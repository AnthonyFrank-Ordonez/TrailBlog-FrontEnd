import { Component, DestroyRef, HostListener, inject, OnDestroy } from '@angular/core';
import { ZardDropdownDirective } from '../dropdown/dropdown-trigger.directive';
import { ZardDropdownMenuContentComponent } from '../dropdown/dropdown-menu-content.component';
import { ZardDropdownMenuLabelComponent } from '../dropdown/dropdown-label.component';
import { ZardDropdownMenuItemComponent } from '../dropdown/dropdown-item.component';
import { ZardDividerComponent } from '../divider/divider.component';
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

@Component({
  selector: 'app-header',
  imports: [
    ZardDropdownDirective,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuLabelComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
    RouterLink,
    InitialsPipe,
    Tooltip,
    NgOptimizedImage,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private userService = inject(UserService);
  private postService = inject(PostService);
  private communityService = inject(CommunityService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isAuthenticated = this.authService.isAuthenticated;
  user = this.userService.user;
  activeTab = this.userService.activeUserTab;

  hideHeader = false;
  hideBottomNav = false;
  scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  lastScrollTop = 0;

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

  ngOnDestroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
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

  private clearServiceData() {
    this.postService.resetPostServiceData();
    this.communityService.resetCommunityServiceData();
  }
}
