import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  passwordMatchValidator,
  strongPasswordValidator,
  usernameValidator,
} from '@shared/utils/validators';
import { ApiError } from 'src/app/core/models/interface/api-error';
import { RegisterData } from 'src/app/core/models/interface/auth';
import { AuthService } from 'src/app/core/services/auth.service';
import { MessageService } from 'src/app/core/services/message.service';
import {
  ZardPopoverDirective,
  ZardPopoverComponent,
} from '@shared/components/popover/popover.component';
// import { Register } from 'src/app/core/models/interface/auth';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, ZardPopoverDirective, ZardPopoverComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  isLoading = signal<boolean>(false);

  signupForm: FormGroup = this.createForm();

  private createForm(): FormGroup {
    return this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(5), usernameValidator]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  get usernameErrors() {
    const control = this.signupForm.get('username');
    return control?.errors && control.touched;
  }

  get emailErrors() {
    const control = this.signupForm.get('email');
    return control?.errors && control.touched;
  }

  get passwordErrors() {
    const control = this.signupForm.get('password');
    return control?.errors && control.touched;
  }

  get passwordMismatchError() {
    return (
      this.signupForm.get('confirmPassword')?.hasError('passwordMismatch') &&
      this.signupForm.get('confirmPassword')?.touched
    );
  }

  async onSignUp() {
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading.set(true);

    const { username, email, password } = this.signupForm.value;

    const userData: RegisterData = {
      username,
      email,
      password,
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.isLoading.set(false);

        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          this.messageService.showMessage('error', error.error.message);
          console.error(error.error.message);
        } else if (error.error && typeof error.error === 'object') {
          const apiError = error.error as ApiError;
          const errorMessage = apiError.detail ?? error.message;

          this.messageService.showMessage('error', errorMessage);
          console.error('An error occured: ', apiError);
        }

        this.isLoading.set(false);
      },
    });
  }
}
