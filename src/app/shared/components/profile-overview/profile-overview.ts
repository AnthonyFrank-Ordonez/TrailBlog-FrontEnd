import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '@core/services/user.service';
import { InitialsPipe } from '../../pipes/initials-pipe';
import { toSignal } from '@angular/core/rxjs-interop';

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
  profileFormValues = toSignal(this.profileForm.valueChanges, {
    initialValue: this.profileForm.value,
  });

  hasChanges = computed(() => {
    const current = this.profileFormValues();
    const original = this.currentUser();

    return current.username !== original?.username || current.email !== original?.email;
  });

  constructor() {
    this.profileForm.disable();
  }

  toggleEditMode() {
    const newMode = !this.editMode();
    this.editMode.set(newMode);

    if (newMode) {
      this.profileForm.enable();
    } else {
      this.profileForm.reset({
        username: this.currentUser()?.username,
        email: this.currentUser()?.email,
        bio: '',
        avatar: null,
      });
      this.selectedFileName.set(null);
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

  onProfileSubmit() {
    if (this.profileForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('username', this.profileForm.value.username!.toLowerCase().trim());
    formData.append('email', this.profileForm.value.email!.toLowerCase().trim());
    formData.append('bio', this.profileForm.value?.bio ?? '');

    if (this.profileForm.value.avatar) {
      formData.append('avatar', this.profileForm.value.avatar);
    }
  }

  get usernameErrors() {
    const control = this.profileForm.get('username');
    return control?.errors && control.touched;
  }

  get emailErrors() {
    const control = this.profileForm.get('email');
    return control?.errors && control.touched;
  }

  private createForm() {
    return this.fb.group({
      username: [this.currentUser()?.username, [Validators.minLength(5), Validators.required]],
      email: [this.currentUser()?.email, [Validators.required, Validators.email]],
      bio: ['', []],
      avatar: new FormControl<File | null>(null),
    });
  }
}
