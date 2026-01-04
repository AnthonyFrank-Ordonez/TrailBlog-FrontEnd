import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { InitialsPipe } from '@shared/pipes/initials-pipe';

@Component({
  selector: 'app-profile',
  imports: [InitialsPipe, NgClass],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private userService = inject(UserService);

  currentUser = this.userService.user;
  activeProfileBtn = signal<string>('profile');
  profileBtns = signal<string[]>(['profile', 'posts', 'saved', 'comments', 'history', 'settings']);

  setActiveProfileBtn(btn: string) {
    this.activeProfileBtn.set(btn);
  }
}
