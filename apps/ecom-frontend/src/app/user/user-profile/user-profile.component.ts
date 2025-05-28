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
    this.user$.subscribe(user => {
      console.log('Données utilisateur reçues:', user);
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
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      this.authService.updatePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.updateSuccess = true;
          this.updateError = '';
          this.passwordForm.reset();
          setTimeout(() => this.updateSuccess = false, 3000);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur lors de la mise à jour du mot de passe:', error);
          if (error.status === 403) {
            this.updateError = 'Vous n\'êtes pas autorisé à effectuer cette action. Veuillez vous reconnecter.';
          } else {
            this.updateError = error.error?.message || 'Une erreur est survenue lors de la mise à jour du mot de passe';
          }
          setTimeout(() => this.updateError = '', 3000);
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}