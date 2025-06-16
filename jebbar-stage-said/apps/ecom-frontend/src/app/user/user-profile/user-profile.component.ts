import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BaseUser } from '../../shared/model/user.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { faEye, faEyeSlash, faSave, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'ecom-user-profile',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  user$ = this.authService.currentUser$;

  passwordForm: FormGroup;
  showPassword = false;
  showNewPassword = false;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faSave = faSave;
  faSignOut = faSignOutAlt;
  updateSuccess = false;
  updateError = '';

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  togglePasswordVisibility(field: 'current' | 'new') {
    if (field === 'current') {
      this.showPassword = !this.showPassword;
    } else {
      this.showNewPassword = !this.showNewPassword;
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      console.log('Formulaire valide, envoi de la requête...');
      const { currentPassword, newPassword } = this.passwordForm.value;
      
      this.authService.updatePassword(currentPassword, newPassword).subscribe({
        next: (response) => {
          console.log('Réponse reçue:', response);
          this.updateSuccess = true;
          this.updateError = '';
          this.passwordForm.reset();
          
          // Effacer le message de succès après 3 secondes
          setTimeout(() => {
            this.updateSuccess = false;
          }, 3000);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur détaillée:', error);
          this.updateSuccess = false;
          if (error.status === 403) {
            this.updateError = 'Vous n\'êtes pas autorisé à effectuer cette action.';
          } else {
            this.updateError = error.error?.message || 'Une erreur est survenue lors de la mise à jour du mot de passe';
          }
          // Effacer le message d'erreur après 3 secondes
          setTimeout(() => {
            this.updateError = '';
          }, 3000);
        }
      });
    } else {
      console.log('Formulaire invalide:', this.passwordForm.errors);
      this.updateError = 'Veuillez remplir correctement tous les champs';
      setTimeout(() => {
        this.updateError = '';
      }, 3000);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}