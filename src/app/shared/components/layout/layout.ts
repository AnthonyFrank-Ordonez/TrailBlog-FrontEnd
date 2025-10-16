import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { SideNavigation } from '../side-navigation/side-navigation';
import { RightSidebar } from '../right-sidebar/right-sidebar';
import { Modal } from '../modal/modal';
import { ModalService } from '@core/services/modal.service';
import { CommunityForm } from '../community-form/community-form';
import { ConfirmationModal } from '../confirmation-modal/confirmation-modal';
import { MessageService } from '@core/services/message.service';
import { CommunityService } from '@core/services/community.service';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { handleHttpError } from '@shared/utils/utils';

@Component({
  selector: 'app-layout',
  imports: [
    Header,
    SideNavigation,
    RouterOutlet,
    RightSidebar,
    Modal,
    CommunityForm,
    ConfirmationModal,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private modalService = inject(ModalService);

  modalConfig = this.modalService.modalConfig;
  isModalOpen = this.modalService.isModalOpen;

  protected onModalConfirm(): void {
    this.modalService.confirm();
  }

  protected onModalCancel(): void {
    this.modalService.cancel();
  }
}
