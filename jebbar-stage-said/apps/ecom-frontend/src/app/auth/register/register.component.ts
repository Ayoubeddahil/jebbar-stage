import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class RegisterComponent {
  registerForm: FormGroup;
  verificationForm: FormGroup;
  error: string | null = null;
  isLoading: boolean = false;
  showVerification: boolean = false;
  emailSent: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)]]
    });

    this.verificationForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid || this.isLoading) return;

    this.error = null;
    this.isLoading = true;
    
    const { email } = this.registerForm.value;
    
    this.authService.sendVerificationCode(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.emailSent = true;
        this.showVerification = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Failed to send verification code. Please try again.';
      }
    });
  }

  onVerify() {
    if (this.verificationForm.invalid || this.isLoading) return;

    this.error = null;
    this.isLoading = true;
    
    const { username, email, password } = this.registerForm.value;
    const { code } = this.verificationForm.value;
    
    this.authService.register(username, email, password, code).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['']);
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  resendCode() {
    if (this.isLoading) return;
    
    this.error = null;
    this.isLoading = true;
    
    const { email } = this.registerForm.value;
    
    this.authService.sendVerificationCode(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.emailSent = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Failed to resend verification code. Please try again.';
      }
    });
  }
}