import { computed, inject, Injectable, signal } from '@angular/core';
import { ModalConfig, ModalData } from '@core/models/interface/modal';
import { CurrentRouteService } from './current-route.service';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private currentRouteService = inject(CurrentRouteService);
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

  showAuthRequiredModal() {
    this.openModal({
      type: 'error',
      title: 'Oops, Something wen’t wrong',
      description: 'Unable to process your request',
      content: 'error-modal',
      subcontent:
        'You need to login first before you can use this react button for post, The login button will redirect you to the login page',
      confirmBtnText: 'Login',

      cancelBtnText: 'Cancel',
      onConfirm: () => this.currentRouteService.handleRedirection('/login'),
    });
  }
}
