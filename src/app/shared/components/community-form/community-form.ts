import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import { CreateCommunityRequest } from '@core/models/interface/community';
import { CommunityService } from '@core/services/community.service';
import { MessageService } from '@core/services/message.service';
import { ModalService } from '@core/services/modal.service';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { handleHttpError } from '@shared/utils/utils';

@Component({
  selector: 'app-community-form',
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule, InitialsPipe],
  templateUrl: './community-form.html',
  styleUrl: './community-form.css',
})
export class CommunityForm {
  private modalService = inject(ModalService);
  private communityService = inject(CommunityService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private readonly NAME_MAX_LENGTH = 30;
  private readonly DESCIPTION_MAX_LENGTH = 300;

  isSubmitting = this.communityService.isSubmitting;

  communityForm: FormGroup = this.createForm();

  constructor() {
    effect(() => {
      const isModalOpen = this.modalService.isModalOpen();

      if (!isModalOpen) {
        setTimeout(() => {
          this.resetForm();
        }, 350);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: [
        '',
        [Validators.required, Validators.maxLength(this.NAME_MAX_LENGTH), Validators.minLength(3)],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.DESCIPTION_MAX_LENGTH),
          Validators.minLength(10),
        ],
      ],
    });
  }

  private resetForm(): void {
    this.communityForm.reset();
  }

  get communityName(): string {
    return this.communityForm.get('name')?.value || '';
  }

  get descriptionValue(): string {
    return this.communityForm.get('description')?.value || '';
  }

  get communityNameLength(): number {
    return this.communityForm.get('name')?.value?.length || 0;
  }

  get descriptionLength(): number {
    return this.communityForm.get('description')?.value?.length || 0;
  }

  handleCommunitySubmit() {
    if (this.communityForm.invalid) {
      return;
    }

    const communityFormData: CreateCommunityRequest = {
      name: this.communityForm.value.name.trim(),
      description: this.communityForm.value.description.trim(),
    };

    this.communityService
      .createCommunity(communityFormData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.modalService.closeModal();
        },
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  cancelCreateCommunity(): void {
    this.modalService.closeModal();
  }
}
