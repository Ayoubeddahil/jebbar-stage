import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../shared/model/user.model';
import { AuthService } from '../../../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Liste des Utilisateurs</h1>

      <!-- Notification -->
      <div *ngIf="notification.show" 
           [class]="'mb-4 p-4 rounded-lg ' + (notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')"
           class="transition-all duration-300">
        {{ notification.message }}
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-300">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-6 py-3 border-b text-left">ID</th>
              <th class="px-6 py-3 border-b text-left">Nom d'utilisateur</th>
              <th class="px-6 py-3 border-b text-left">Email</th>
              <th class="px-6 py-3 border-b text-left">Rôles</th>
              <th class="px-6 py-3 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users" class="hover:bg-gray-50">
              <td class="px-6 py-4 border-b">{{user.id}}</td>
              <td class="px-6 py-4 border-b">{{user.username}}</td>
              <td class="px-6 py-4 border-b">{{user.email}}</td>
              <td class="px-6 py-4 border-b">
                <select [ngModel]="getCurrentRole(user)" 
                        (ngModelChange)="onRoleChange(user, $event)"
                        class="border rounded px-2 py-1">
                  <option value="ROLE_USER">Client</option>
                  <option value="ROLE_ADMIN">Administrateur</option>
                </select>
              </td>
              <td class="px-6 py-4 border-b">
                <button (click)="deleteUser(user)" 
                        class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  notification = {
    show: false,
    message: '',
    type: 'success'
  };

  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Initialisation du composant UserList');
    this.checkAdminAccess();
    this.loadUsers();
  }

  private checkAdminAccess(): void {
    console.log('Vérification des droits d\'accès...');
    const token = this.authService.getToken();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Token présent:', !!token);
    console.log('Utilisateur actuel:', user);
    console.log('Rôles de l\'utilisateur:', user?.roles);
    
    if (!this.authService.isAuthenticated()) {
      console.error('Utilisateur non authentifié');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.hasRole('ROLE_ADMIN')) {
      console.error('Utilisateur n\'a pas le rôle ADMIN');
      this.router.navigate(['/']);
      return;
    }

    console.log('Accès admin confirmé');
  }

  loadUsers(): void {
    console.log('Chargement des utilisateurs...');
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Utilisateurs chargés:', users);
        this.users = users.map(user => ({
          ...user,
          roles: Array.isArray(user.roles) ? user.roles : [user.roles || 'ROLE_USER']
        }));
        console.log('Utilisateurs après traitement:', this.users);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        console.error('Détails de l\'erreur:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        this.showNotification('Erreur lors du chargement des utilisateurs', 'error');
      }
    });
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = {
      show: true,
      message,
      type
    };
    setTimeout(() => {
      this.notification.show = false;
    }, 3000);
  }

  getCurrentRole(user: User): string {
    if (!user.roles) return 'ROLE_USER';
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    return roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER';
  }

  getUserRoles(user: User): string {
    if (!user.roles) return 'ROLE_USER';
    return Array.isArray(user.roles) ? user.roles.join(', ') : user.roles;
  }

  onRoleChange(user: User, newRole: string): void {
    console.log('Changement de rôle pour l\'utilisateur:', user);
    console.log('Nouveau rôle:', newRole);
    console.log('Token présent:', !!this.authService.getToken());
    console.log('Rôle ADMIN:', this.authService.hasRole('ROLE_ADMIN'));
    
    if (!this.authService.hasRole('ROLE_ADMIN')) {
      console.error('Accès refusé: rôle ADMIN requis');
      return;
    }

    this.updateUserRoles(user, newRole);
  }

  updateUserRoles(user: User, newRole: string): void {
    console.log('Mise à jour des rôles pour l\'utilisateur:', user);
    console.log('Nouveau rôle:', newRole);
    console.log('Token présent:', !!this.authService.getToken());
    
    // Créer un tableau avec le nouveau rôle
    const roles = [newRole];
    console.log('Rôles à envoyer:', roles);
    
    this.userService.updateUserRoles(user.id!, roles).subscribe({
      next: (updatedUser) => {
        console.log('Utilisateur mis à jour avec succès:', updatedUser);
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = {
            ...updatedUser,
            roles: Array.isArray(updatedUser.roles) ? updatedUser.roles : [updatedUser.roles || 'ROLE_USER']
          };
          console.log('Liste des utilisateurs mise à jour:', this.users);
          this.showNotification(`Le rôle de ${updatedUser.username} a été mis à jour`, 'success');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour des rôles:', error);
        console.error('Détails de l\'erreur:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          headers: error.headers
        });
        // Recharger la liste pour restaurer l'état précédent
        this.loadUsers();
        this.showNotification('Erreur lors de la mise à jour du rôle', 'error');
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username} ?`)) {
      console.log('Suppression de l\'utilisateur:', user);
      this.userService.deleteUser(user.id!).subscribe({
        next: () => {
          console.log('Utilisateur supprimé avec succès');
          this.users = this.users.filter(u => u.id !== user.id);
          this.showNotification(`L'utilisateur ${user.username} a été supprimé avec succès`, 'success');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.showNotification('Erreur lors de la suppression de l\'utilisateur', 'error');
        }
      });
    }
  }
} 