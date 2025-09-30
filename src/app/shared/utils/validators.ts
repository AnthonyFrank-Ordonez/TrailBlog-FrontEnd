import { AbstractControl, ValidationErrors } from '@angular/forms';

export function usernameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value) return null;

  const hasCapitalLetter = /[A-Z]/.test(value);
  return hasCapitalLetter ? null : { noCapitalLetter: true };
}

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    const errors = confirmPassword.errors;
    if (errors) {
      delete errors['passwordMismatch'];
      confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
    }
  }

  return null;
}

export function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const errors: ValidationErrors = {};

  if (!/[A-Z]/.test(value)) {
    errors['noUpperCase'] = true;
  }

  if (!/[0-9]/.test(value)) {
    errors['noNumber'] = true;
  }

  if (!/[!@#$%^&*()_+\-={};':"\\|,.<>\/?]/.test(value)) {
    errors['noSpecialChar'] = true;
  }

  return Object.keys(errors).length ? errors : null;
}
