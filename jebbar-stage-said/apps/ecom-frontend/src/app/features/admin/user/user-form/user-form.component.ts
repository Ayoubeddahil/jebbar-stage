import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../../../shared/model/user.model';
import { UserService } from '../../../../core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">{{ data ? 'Modifier' : 'Ajouter' }} un utilisateur</h2>
      
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <mat-form-field class="w-full mb-4">
          <mat-label>Nom d'utilisateur</mat-label>
          <input matInput formControlName="username" required>
          <mat-error *ngIf="userForm.get('username')?.hasError('required')">
            Le nom d'utilisateur est requis
          </mat-error>
        </mat-form-field>

        <mat-form-field class="w-full mb-4">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" required>
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">
            L'email est requis
          </mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">
            Format d'email invalide
          </mat-error>
        </mat-form-field>

        <mat-form-field class="w-full mb-4" *ngIf="!data">
          <mat-label>Mot de passe</mat-label>
          <input matInput formControlName="password" type="password" required>
          <mat-error *ngIf="userForm.get('password')?.hasError('required')">
            Le mot de passe est requis
          </mat-error>
        </mat-form-field>

        <mat-form-field class="w-full mb-4">
          <mat-label>Prénom</mat-label>
          <input matInput formControlName="firstName">
        </mat-form-field>

        <mat-form-field class="w-full mb-4">
          <mat-label>Nom</mat-label>
          <input matInput formControlName="lastName">
        </mat-form-field>

        <mat-form-field class="w-full mb-4">
          <mat-label>URL de l'image</mat-label>
          <input matInput formControlName="imageUrl">
        </mat-form-field>

        <mat-form-field class="w-full mb-4">
          <mat-label>Rôles</mat-label>
          <mat-select formControlName="roles" multiple>
            <mat-option value="ROLE_USER">Utilisateur</mat-option>
            <mat-option value="ROLE_ADMIN">Administrateur</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="flex justify-end gap-2">
          <button mat-button type="button" (click)="onCancel()">Annuler</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid">
            {{ data ? 'Modifier' : 'Ajouter' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.data ? [] : Validators.required],
      firstName: [''],
      lastName: [''],
      imageUrl: [''],
      roles: [[]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.userForm.patchValue(this.data);
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      if (this.data) {
        this.userService.updateUser(this.data.id!, userData).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur modifié avec succès', 'Fermer', {
              duration: 3000
            });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.snackBar.open('Erreur lors de la modification de l\'utilisateur', 'Fermer', {
              duration: 3000
            });
          }
        });
      } else {
        this.userService.createUser(userData).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur créé avec succès', 'Fermer', {
              duration: 3000
            });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.snackBar.open('Erreur lors de la création de l\'utilisateur', 'Fermer', {
              duration: 3000
            });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 