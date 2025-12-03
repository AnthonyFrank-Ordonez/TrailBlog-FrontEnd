import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-about',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  private fb = new FormBuilder();

  contactForm: FormGroup;
  isSubmitting = signal(false);

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formData = this.contactForm.value;

    // TODO: Replace this with actual email service call
    console.log('Contact form submitted:', formData);

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.contactForm.reset();
    }, 1500);
  }
}
