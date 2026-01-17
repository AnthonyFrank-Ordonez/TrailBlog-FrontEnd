import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  passwordMatchValidator,
  strongPasswordValidator,
  usernameValidator,
} from '@shared/utils/validators';
import { RegisterData } from '@core/models/interface/auth';
import { AuthService } from '@core/services/auth.service';
import { MessageService } from '@core/services/message.service';
import {
  ZardPopoverDirective,
  ZardPopoverComponent,
} from '@shared/components/popover/popover.component';
import { handleHttpError } from '@shared/utils/utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from '@shared/components/button/button';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, ZardPopoverDirective, ZardPopoverComponent, Button],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isLoading = signal<boolean>(false);
  isRegistering = this.authService.isRegistering;

  signupForm: FormGroup = this.createForm();

  private createForm(): FormGroup {
    return this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(5), usernameValidator]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator },
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
    if (this.signupForm.invalid || this.isRegistering()) {
      return;
    }

    const { username, email, password } = this.signupForm.value;

    const userData: RegisterData = {
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
    };

    this.authService
      .register(userData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }
}
