import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  submitSuccess = false;
  submitError = false;
  isSubmitting = false;
  contactForm: FormGroup;
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitSuccess = false;
      this.submitError = false;
      this.errorMessage = '';

      // Créer un formulaire HTML temporaire
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://formsubmit.co/aboulkasimzakaria@gmail.com';
      form.style.display = 'none';

      // Ajouter les champs cachés
      const fields = {
        name: this.contactForm.get('name')?.value,
        email: this.contactForm.get('email')?.value,
        message: this.contactForm.get('message')?.value,
        _subject: 'Nouveau message de contact',
        _template: 'table',
        _captcha: 'false',
        _next: window.location.origin + '/contact'
      };

      // Créer et ajouter les champs au formulaire
      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      // Ajouter le formulaire au document
      document.body.appendChild(form);

      // Soumettre le formulaire
      try {
        form.submit();
        this.submitSuccess = true;
        this.contactForm.reset();
      } catch (error) {
        console.error('Error submitting form:', error);
        this.submitError = true;
        this.errorMessage = 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer plus tard.';
      } finally {
        this.isSubmitting = false;
        // Nettoyer le formulaire temporaire
        document.body.removeChild(form);
      }
    }
  }
} 