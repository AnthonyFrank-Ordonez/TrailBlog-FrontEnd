import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { InitialsPipe } from '../../pipes/initials-pipe';

@Component({
  selector: 'app-profile-overview',
  imports: [ReactiveFormsModule, InitialsPipe],
  templateUrl: './profile-overview.html',
  styleUrl: './profile-overview.css',
})
export class ProfileOverview {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  currentUser = this.userService.user;
  editMode = signal<boolean>(false);
  selectedFileName = signal<string | null>(null);
  profileForm = this.createForm();

  constructor() {
    this.profileForm.disable();
  }

  toggleEditMode() {
    const newMode = !this.editMode();
    this.editMode.set(newMode);

    if (newMode) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFileName.set(file.name);

      // set avatar control value
      this.profileForm.get('avatar')?.setValue(file);
    }
  }

  private createForm() {
    return this.fb.group({
      username: [this.currentUser()?.username, Validators.required],
      email: [this.currentUser()?.email, [Validators.required, Validators.email]],
      bio: ['', []],
      avatar: new FormControl<File | null>(null),
    });
  }
}
