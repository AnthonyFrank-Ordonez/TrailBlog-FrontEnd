import { inject, Injectable, signal, Signal } from '@angular/core';
import { HotToastService, ToastPosition } from '@ngxpert/hot-toast';
import { MessagesOptions } from '../models/interface/messages';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private toast = inject(HotToastService);
  private baseOpt: MessagesOptions = {
    dismissible: true,
    duration: 3000,
    autoClose: true,
    theme: 'snackbar',
    position: 'top-right',
  };

  showMessage(type: string = 'information', message: string = 'An Error Occured'): void {
    switch (type) {
      case 'information':
        this.toast.info(message, {
          ...this.baseOpt,
        });
        break;

      case 'error':
        this.toast.error(message, {
          ...this.baseOpt,
        });
        break;

      case 'warning':
        this.toast.warning(message, {
          ...this.baseOpt,
        });
        break;

      default:
        break;
    }
  }
}
