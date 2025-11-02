import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { User } from '@core/models/interface/user';
import { getActiveTabFromPath } from '@shared/utils/utils';
import { filter, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private router = inject(Router);
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  #userSignal = signal<User | null>(null);

  isAdmin = computed(() => this.#userSignal()?.roles.includes('Admin'));
  activeUserTab = computed(() => getActiveTabFromPath(this.currentUrl() ?? '/'));
  user = this.#userSignal.asReadonly();

  setUser(user: User): void {
    this.#userSignal.set(user);
  }

  clearUser(): void {
    this.#userSignal.set(null);
  }
}
