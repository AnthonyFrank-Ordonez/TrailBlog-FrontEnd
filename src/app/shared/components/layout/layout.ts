import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { SideNavigation } from '../side-navigation/side-navigation';
import { RightSidebar } from '../right-sidebar/right-sidebar';
import { Modal } from '../modal/modal';
import { ModalService } from '@core/services/modal.service';
import { CommunityForm } from '../community-form/community-form';
import { ConfirmationModal } from '../confirmation-modal/confirmation-modal';
import { ErrorModal } from '../error-modal/error-modal';

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
    ErrorModal,
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
