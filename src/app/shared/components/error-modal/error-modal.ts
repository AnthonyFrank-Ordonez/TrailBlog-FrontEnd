import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  imports: [],
  templateUrl: './error-modal.html',
  styleUrl: './error-modal.css',
})
export class ErrorModal {
  contentText = input<string | undefined>();
  cancelText = input<string | undefined>();
  confirmText = input<string | undefined>();
  cancelFn = output<void>();
  confirmFn = output<void>();

  onCancel(): void {
    this.cancelFn.emit();
  }

  onConfirm(): void {
    this.confirmFn.emit();
  }
}
