import { inject, Injectable } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';
import { MessagesOptions, MessagesType } from '@core/models/interface/messages';

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

  private readonly showMessageMap = new Map<MessagesType, (message: string) => void>([
    ['information', (message: string) => this.showInfoMessage(message)],
    ['error', (message: string) => this.showErrorMessage(message)],
    ['warning', (message: string) => this.showWarningMessage(message)],
    ['success', (message: string) => this.showSuccessMessage(message)],
  ]);

  showMessage(type: MessagesType = 'information', message: string = 'An Error Occured'): void {
    const handler = this.showMessageMap.get(type);

    if (handler) {
      handler(message);
    } else {
      console.error(`Invalid message type: ${type}`);
    }
  }

  private showInfoMessage(message: string) {
    this.toast.info(message, {
      ...this.baseOpt,
    });
  }

  private showErrorMessage(message: string) {
    this.toast.error(message, {
      ...this.baseOpt,
    });
  }

  private showWarningMessage(message: string) {
    this.toast.warning(message, {
      ...this.baseOpt,
    });
  }

  private showSuccessMessage(message: string) {
    this.toast.success(message, {
      ...this.baseOpt,
    });
  }
}
