import { computed, inject, Injectable, signal } from '@angular/core';
import { MenuModalConfig, MenuModalStrategy, ModalConfig } from '@core/models/interface/modal';
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
  private readonly confirmHandlers = new Map<string, (config: ModalConfig) => void>([
    [
      'community',
      (config) => {
        if (config.type === 'community') {
          config.onConfirm?.(config.data.communityId);
        }
      },
    ],
    [
      'menu',
      (config) => {
        if (config.type === 'menu') {
          config.onConfirm?.(config.data.post, config.data.activeTab);
        }
      },
    ],
    [
      'generic',
      (config) => {
        if (config.type === 'generic') {
          config.onConfirm?.();
        }
      },
    ],
  ]);
  readonly menuModalConfig: Record<MenuModalStrategy, MenuModalConfig> = {
    archive: {
      title: 'Archive Post',
      description: 'Are you sure you want to archive this post?',
      confirmBtnText: 'Archive',
      cancelBtnText: 'Cancel',
      subcontent:
        'Once you archive this post, it cannot be undone. Are you sure you want to archive this post?',
    },
    delete: {
      title: 'Delete Post',
      description: 'Are you sure you want to delete this post?',
      confirmBtnText: 'Delete',
      cancelBtnText: 'Cancel',
      subcontent:
        'Once you delete this post, it cannot be undone. Are you sure you want to delete this post?',
    },
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
      const handler = this.confirmHandlers.get(currentModalConfig.type!);

      if (handler) {
        handler(currentModalConfig);
      } else {
        console.error('No handler found for type: ' + currentModalConfig.type);
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
