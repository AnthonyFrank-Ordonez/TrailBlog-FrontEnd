import { computed, Injectable, signal } from '@angular/core';
import { ModalConfig, ModalData } from '@core/models/interface/modal';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly DEFAULT_CONFIG: ModalConfig = {
    type: 'generic',
    title: '',
    description: '',
  };

  #isOpenSignal = signal<boolean>(false);
  #modalConfigSignal = signal<ModalConfig>(this.DEFAULT_CONFIG);

  isModalOpen = this.#isOpenSignal.asReadonly();
  modalConfig = this.#modalConfigSignal.asReadonly();

  title = computed(() => this.#modalConfigSignal()?.title ?? '');
  description = computed(() => this.#modalConfigSignal()?.description ?? '');

  openModal(config: ModalConfig) {
    this.#modalConfigSignal.set(config);
    this.#isOpenSignal.set(true);
    document.body.classList.add('overflow-hidden');
  }

  closeModal() {
    this.#isOpenSignal.set(false);

    setTimeout(() => {
      this.#modalConfigSignal.set(this.DEFAULT_CONFIG);
    }, 350);

    document.body.classList.remove('overflow-hidden');
  }

  confirm() {
    const currentModalConfig = this.#modalConfigSignal();

    if (currentModalConfig.onConfirm) {
      if (currentModalConfig?.type === 'community') {
        currentModalConfig.onConfirm(currentModalConfig.data.communityId);
      } else {
        currentModalConfig.onConfirm();
      }
    }
    this.closeModal();
  }

  cancel() {
    this.closeModal();
  }
}
