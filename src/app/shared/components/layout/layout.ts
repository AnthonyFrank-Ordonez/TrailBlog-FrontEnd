import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { SideNavigation } from '../side-navigation/side-navigation';
import { RightSidebar } from '../right-sidebar/right-sidebar';
import { Modal } from '../modal/modal';
import { ModalService } from '@core/services/modal.service';
import { CommunityForm } from '../community-form/community-form';

@Component({
  selector: 'app-layout',
  imports: [Header, SideNavigation, RouterOutlet, RightSidebar, Modal, CommunityForm],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private modalService = inject(ModalService);

  isModalOpen = this.modalService.isModalOpen;
  modalTitle = this.modalService.title;
  modalDescription = this.modalService.description;

  closeModal(): void {
    this.modalService.closeModal();
  }
}
