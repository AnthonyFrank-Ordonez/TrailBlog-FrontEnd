import { NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileTabConfig } from '@core/models/interface/pages';
import { UserService } from '@core/services/user.service';
import { ProfileOverview } from '@shared/components/profile-overview/profile-overview';
import { ProfilePosts } from '@shared/components/profile-posts/profile-posts';
import { InitialsPipe } from '@shared/pipes/initials-pipe';

@Component({
  selector: 'app-profile',
  imports: [InitialsPipe, NgClass, ProfileOverview, ProfilePosts],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly profileTabConfig: Record<string, ProfileTabConfig> = {
    overview: { component: 'profile-overview' },
    posts: { component: 'profile-posts' },
    saved: { component: 'profile-saved' },
    comments: { component: 'profile-comments' },
    history: { component: 'profile-history' },
  };
  currentUser = this.userService.user;
  activeProfileBtn = signal<string>('overview');
  profileBtns = signal<string[]>(['overview', 'posts', 'saved', 'comments', 'history']);

  profileTabComponent = computed(() => {
    const config = this.profileTabConfig[this.activeProfileBtn()];

    if (!config) return null;
    return config.component;
  });

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment && this.profileBtns().includes(fragment)) {
        this.activeProfileBtn.set(fragment);
      } else {
        this.router.navigate([], { fragment: 'overview', replaceUrl: true });
      }
    });
  }

  setActiveProfileBtn(btn: string) {
    this.activeProfileBtn.set(btn);
    this.router.navigate([], { fragment: btn, replaceUrl: true });
  }
}
