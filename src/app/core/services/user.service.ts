import { computed, Injectable, signal } from '@angular/core';
import { User } from '@core/models/interface/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  #userSignal = signal<User | null>(null);
  #activeUserTabSignal = signal<string>('home');
  isAdmin = computed(() => this.#userSignal()?.roles.includes('Admin'));

  user = this.#userSignal.asReadonly();
  activeUserTab = this.#activeUserTabSignal.asReadonly();

  setUser(user: User): void {
    this.#userSignal.set(user);
  }

  clearUser(): void {
    this.#userSignal.set(null);
  }

  setActiveUserTab(value: string): void {
    this.#activeUserTabSignal.set(value);
  }
}
