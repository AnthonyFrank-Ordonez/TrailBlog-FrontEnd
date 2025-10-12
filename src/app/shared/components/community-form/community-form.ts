import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import { InitialsPipe } from '@shared/pipes/initials-pipe';

@Component({
  selector: 'app-community-form',
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule, InitialsPipe],
  templateUrl: './community-form.html',
  styleUrl: './community-form.css',
})
export class CommunityForm {
  private fb = inject(FormBuilder);
  private readonly NAME_MAX_LENGTH = 30;
  private readonly DESCIPTION_MAX_LENGTH = 300;

  communityForm: FormGroup = this.createForm();

  private createForm(): FormGroup {
    return this.fb.group({
      name: [
        '',
        Validators.required,
        Validators.maxLength(this.NAME_MAX_LENGTH),
        Validators.minLength(3),
      ],
      description: [
        '',
        Validators.required,
        Validators.maxLength(this.DESCIPTION_MAX_LENGTH),
        Validators.minLength(10),
      ],
    });
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
  }
}
