import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ModalService } from '@core/services/modal.service';

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

  private modalService = inject(ModalService);

  onCancel(): void {
    this.cancelFn.emit();
  }

  onConfirm(): void {
    this.confirmFn.emit();
  }
}
