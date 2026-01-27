import { Injectable, signal } from '@angular/core';
import { DropdownObject, DropdownType } from '@core/models/interface/dropdown';

@Injectable({
  providedIn: 'root',
})
export class DropdownService {
  #activeDropdownSignal = signal<DropdownObject>({ type: null, id: null });

  activeDropdown = this.#activeDropdownSignal.asReadonly();

  // Checks if there is an active dropdown
  hasActiveDropdown(): boolean {
    return this.#activeDropdownSignal().type !== null && this.#activeDropdownSignal().id !== null;
  }

  isDropDownOpen(type: DropdownType, id: string): boolean {
    const active = this.#activeDropdownSignal();
    return active.type === type && active.id === id;
  }

  updateActiveDropdown(type: DropdownType, id: string) {
    this.#activeDropdownSignal.set({ type: type, id: id });
  }

  closeDropdown(): void {
    this.#activeDropdownSignal.set({ type: null, id: null });
  }

  toggleDropdown(type: DropdownType, id: string): void {
    if (this.isDropDownOpen(type, id)) {
      this.closeDropdown();
    } else {
      this.updateActiveDropdown(type, id);
    }
  }
}
