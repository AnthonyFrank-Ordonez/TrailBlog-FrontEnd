import { computed, Injectable, signal } from '@angular/core';
import { ModalConfig } from '@core/models/interface/modal';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  #isOpen = signal<boolean>(false);
  #config = signal<ModalConfig>({
    title: '',
    description: '',
  });

  isModalOpen = this.#isOpen.asReadonly();
  title = computed(() => this.#config().title || '');
  description = computed(() => this.#config().description || '');

  openModal(config: ModalConfig) {
    this.#config.update((conf) => ({
      conf,
      ...config,
    }));
    this.#isOpen.set(true);
    document.body.classList.add('overflow-hidden');
  }

  closeModal() {
    this.#isOpen.set(false);
    document.body.classList.remove('overflow-hidden');
  }
}
