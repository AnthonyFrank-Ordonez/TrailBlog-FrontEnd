import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ProfileTabConfig } from '@core/models/interface/pages';
import { UserService } from '@core/services/user.service';
import { ProfileOverview } from '@shared/components/profile-overview/profile-overview';
import { InitialsPipe } from '@shared/pipes/initials-pipe';

@Component({
  selector: 'app-profile',
  imports: [InitialsPipe, NgClass, ProfileOverview],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private userService = inject(UserService);

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

  setActiveProfileBtn(btn: string) {
    this.activeProfileBtn.set(btn);
  }
}
