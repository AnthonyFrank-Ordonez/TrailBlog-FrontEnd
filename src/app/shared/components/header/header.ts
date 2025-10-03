import { Component, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { ZardTooltipModule } from '../tooltip/tooltip';
import { ZardDropdownDirective } from '../dropdown/dropdown-trigger.directive';
import { ZardDropdownMenuContentComponent } from '../dropdown/dropdown-menu-content.component';
import { ZardDropdownMenuLabelComponent } from '../dropdown/dropdown-label.component';
import { ZardDropdownMenuItemComponent } from '../dropdown/dropdown-item.component';
import { ZardDividerComponent } from '../divider/divider.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'src/app/core/services/message.service';
import { ApiError } from 'src/app/core/models/interface/api-error';

@Component({
  selector: 'app-header',
  imports: [
    ZardTooltipModule,
    ZardDropdownDirective,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuLabelComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
    RouterLink,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  isAuthenticated = this.authService.isAuthenticated;

  activeTab = signal<string>('home');
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

  async onSignOut(): Promise<void> {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          this.messageService.showMessage('error', error.error.message);
          console.error(error.error.message);
        } else if (error.error && typeof error.error === 'object') {
          const apiError = error.error as ApiError;
          const errorMessage = apiError.detail ?? error.message;

          this.messageService.showMessage('error', errorMessage);
          console.error('An error occured: ', apiError);
        }
      },
    });
  }
}
