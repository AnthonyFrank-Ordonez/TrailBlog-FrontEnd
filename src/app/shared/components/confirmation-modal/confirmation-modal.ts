import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  imports: [],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.css',
})
export class ConfirmationModal {
  @Input() cancelText: string | undefined;
  @Input() confirmText: string | undefined;
  @Input() contentText: string | undefined;
  @Output() cancelFn = new EventEmitter<void>();
  @Output() confirmFn = new EventEmitter<void>();

  onCancel(): void {
    this.cancelFn.emit();
  }

  onConfirm(): void {
    this.confirmFn.emit();
  }
}
