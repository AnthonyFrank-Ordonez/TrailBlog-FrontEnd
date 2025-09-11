import { Component, HostListener, signal } from '@angular/core';
import { ZardTooltipModule } from '../tooltip/tooltip';
import { ZardDropdownDirective } from '../dropdown/dropdown-trigger.directive';
import { ZardDropdownMenuContentComponent } from '../dropdown/dropdown-menu-content.component';
import { ZardDropdownMenuLabelComponent } from '../dropdown/dropdown-label.component';
import { ZardDropdownMenuItemComponent } from '../dropdown/dropdown-item.component';
import { ZardDividerComponent } from '../divider/divider.component';

@Component({
  selector: 'app-header',
  imports: [
    ZardTooltipModule,
    ZardDropdownDirective,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuLabelComponent,
    ZardDropdownMenuItemComponent,
    ZardDividerComponent,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  activeTab = signal<string>('home');
  hideHeader = false;
  hideBottomNav = false;
  scrollTimeout: any;
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
}
