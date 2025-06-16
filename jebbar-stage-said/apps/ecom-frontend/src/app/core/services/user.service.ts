import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/model/user.model';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllUsers(): Observable<User[]> {
    console.log('Récupération de tous les utilisateurs');
    console.log('Token utilisé pour la requête:', this.authService.getToken());
    return this.http.get<User[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user, { headers: this.getHeaders() });
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, { headers: this.getHeaders() });
  }

  updateUserRoles(id: number, roles: string[]): Observable<User> {
    console.log('Mise à jour des rôles - ID:', id);
    console.log('Rôles à envoyer:', roles);
    console.log('Token utilisé:', this.authService.getToken());
    
    // Envoyer les rôles comme un tableau simple
    return this.http.put<User>(`${this.apiUrl}/${id}/roles`, roles, { 
      headers: this.getHeaders()
    });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
} 