import { computed, effect, Injectable, OnInit, signal } from '@angular/core';
import { User, UserSettings } from '../models/interface/user';

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
