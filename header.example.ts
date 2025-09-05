import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-mobile-header',
  template: `
    <!-- Top Header -->
    <header
      class="fixed top-0 left-0 right-0 bg-gray-900 text-white z-50 transition-transform duration-300 ease-in-out"
      [class.transform]="true"
      [class.-translate-y-full]="hideHeader"
    >
      <div class="flex items-center justify-between px-4 py-3">
        <!-- Hamburger Menu -->
        <button class="p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>

        <!-- Reddit Logo -->
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-sm">r</span>
          </div>
          <span class="text-orange-500 font-bold text-xl">reddit</span>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>

        <!-- Right Icons -->
        <div class="flex items-center space-x-3">
          <!-- Search Icon -->
          <button class="p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
              ></path>
            </svg>
          </button>

          <!-- Profile Avatar -->
          <div class="relative">
            <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <!-- Online indicator -->
            <div
              class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"
            ></div>
          </div>
        </div>
      </div>
    </header>

    <!-- Bottom Navigation -->
    <nav
      class="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50 transition-transform duration-300 ease-in-out"
      [class.transform]="true"
      [class.translate-y-full]="hideBottomNav"
    >
      <div class="flex items-center justify-around py-2">
        <button
          class="flex flex-col items-center justify-center p-2 space-y-1"
          [class.text-orange-500]="activeTab === 'home'"
          [class.text-gray-400]="activeTab !== 'home'"
          (click)="setActiveTab('home')"
        >
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span class="text-xs">Home</span>
        </button>

        <button
          class="flex flex-col items-center justify-center p-2 space-y-1"
          [class.text-orange-500]="activeTab === 'answers'"
          [class.text-gray-400]="activeTab !== 'answers'"
          (click)="setActiveTab('answers')"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span class="text-xs">Answers</span>
        </button>

        <button
          class="flex flex-col items-center justify-center p-2 space-y-1"
          [class.text-orange-500]="activeTab === 'create'"
          [class.text-gray-400]="activeTab !== 'create'"
          (click)="setActiveTab('create')"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          <span class="text-xs">Create</span>
        </button>

        <button
          class="flex flex-col items-center justify-center p-2 space-y-1"
          [class.text-orange-500]="activeTab === 'chat'"
          [class.text-gray-400]="activeTab !== 'chat'"
          (click)="setActiveTab('chat')"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
          <span class="text-xs">Chat</span>
        </button>

        <button
          class="flex flex-col items-center justify-center p-2 space-y-1"
          [class.text-orange-500]="activeTab === 'inbox'"
          [class.text-gray-400]="activeTab !== 'inbox'"
          (click)="setActiveTab('inbox')"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            ></path>
          </svg>
          <span class="text-xs">Inbox</span>
        </button>
      </div>
    </nav>
  `,
})
export class MobileHeaderComponent implements OnInit {
  hideHeader = false;
  hideBottomNav = false;
  lastScrollTop = 0;
  scrollTimeout: any;
  activeTab = 'home';

  samplePosts = [
    {
      subreddit: 'angular',
      time: '1d',
      title: 'Reactive algorithms: How Angular took the right path',
      upvotes: 57,
      comments: 27,
      shares: 60,
    },
    {
      subreddit: 'webdev',
      time: '2h',
      title: 'Best practices for modern web development',
      upvotes: 124,
      comments: 43,
      shares: 28,
    },
    {
      subreddit: 'programming',
      time: '4h',
      title: 'Why TypeScript is gaining popularity among developers',
      upvotes: 89,
      comments: 52,
      shares: 35,
    },
    {
      subreddit: 'frontend',
      time: '6h',
      title: 'CSS Grid vs Flexbox: When to use which?',
      upvotes: 156,
      comments: 78,
      shares: 42,
    },
    {
      subreddit: 'javascript',
      time: '8h',
      title: 'Understanding async/await in JavaScript',
      upvotes: 203,
      comments: 91,
      shares: 67,
    },
    {
      subreddit: 'tailwindcss',
      time: '12h',
      title: 'Creating responsive designs with Tailwind CSS',
      upvotes: 145,
      comments: 34,
      shares: 29,
    },
  ];

  ngOnInit() {
    // Component initialization
  }

  @HostListener('window:scroll', ['$event'])
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
    // Here you can add navigation logic or emit events
    console.log('Active tab:', tab);
  }
}
