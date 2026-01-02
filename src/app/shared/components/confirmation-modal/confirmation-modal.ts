import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  imports: [],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css',
})
export class ConfirmationModal {
  cancelText = input<string | undefined>();
  confirmText = input<string | undefined>();
  contentText = input<string | undefined>();
  cancelFn = output<void>();
  confirmFn = output<void>();

  onCancel(): void {
    this.cancelFn.emit();
  }

  onConfirm(): void {
    this.confirmFn.emit();
  }
}
