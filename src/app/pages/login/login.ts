import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Credentials } from 'src/app/core/models/interface/login';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from 'src/app/core/models/interface/api-error';
import { MessageService } from 'src/app/core/services/message.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  isLoading = signal<boolean>(false);

  loginForm: FormGroup = this.createForm();

  private createForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading.set(true);

    const credentials: Credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
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
          this.messageService.showMessage('error', apiError.detail);
          console.error('An error occured: ', apiError);
        }

        this.isLoading.set(false);
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
