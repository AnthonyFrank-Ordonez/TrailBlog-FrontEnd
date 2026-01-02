import {
  Component,
  EventEmitter,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CommunityService } from '@core/services/community.service';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal implements OnChanges {
  isOpen = input<boolean>();
  title = input<string>();
  description = input<string>();
  closeModal = output<void>();

  private communityService = inject(CommunityService);

  isClosing = signal<boolean>(false);
  isCommunityCreating = this.communityService.isSubmitting;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen()) {
        document.body.classList.add('overflow-hidden');
      } else if (!this.isClosing) {
        document.body.classList.remove('overflow-hidden');
      }
    }
  }

  onClose() {
    this.isClosing.set(true);

    setTimeout(() => {
      this.isClosing.set(false);
      this.closeModal.emit();
      document.body.classList.remove('overflow-hidden');
    }, 350);
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onEscapeKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isOpen()) {
      this.onClose();
    }
  }
}
