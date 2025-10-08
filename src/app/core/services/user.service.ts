import { computed, Injectable, signal } from '@angular/core';
import { User } from '@core/models/interface/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  #userSignal = signal<User | null>(null);
  isAdmin = computed(() => this.#userSignal()?.roles.includes('Admin'));

  user = this.#userSignal.asReadonly();

  setUser(user: User): void {
    this.#userSignal.set(user);
  }

  clearUser(): void {
    this.#userSignal.set(null);
  }
}
