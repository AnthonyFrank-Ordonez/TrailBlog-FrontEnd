import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  imports: [],
  templateUrl: './error-modal.html',
  styleUrl: './error-modal.css',
})
export class ErrorModal {
  @Input() contentText: string | undefined;
  @Input() cancelText: string | undefined;
  @Input() confirmText: string | undefined;
  @Output() cancelFn = new EventEmitter<void>();
  @Output() confirmFn = new EventEmitter<void>();

  onCancel(): void {
    this.cancelFn.emit();
  }

  onConfirm(): void {
    this.confirmFn.emit();
  }
}
