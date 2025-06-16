import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, switchMap, of, throwError, catchError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from '../shop/cart.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cartService = inject(CartService);
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token) {
        if (user) {
          try {
            const userData = JSON.parse(user);
            this.currentUserSubject.next(userData);
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
        // Rafraîchir les données du profil
        this.refreshUserProfile();
      }
    }
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  private getUserProfile(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/auth/profile', {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    });
  }

  private refreshUserProfile(): void {
    this.getUserProfile().subscribe({
      next: (userData) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('user', JSON.stringify(userData));
          this.currentUserSubject.next(userData);
        }
      },
      error: () => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        }
      }
    });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:8080/api/auth/signin', { username, password })
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token);
          }
        }),
        switchMap(() => this.getUserProfile()),
        tap(userData => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(userData));
            this.currentUserSubject.next(userData);
          }
        })
      );
  }

  sendVerificationCode(email: string): Observable<any> {
    return this.http.post<any>(
      'http://localhost:8080/api/auth/send-verification',
      { email }
    );
  }

  register(username: string, email: string, password: string, verificationCode: string): Observable<any> {
    return this.http.post<any>(
      'http://localhost:8080/api/auth/signup',
      { username, email, password, verificationCode }
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Vider le panier lors de la déconnexion
      this.cartService.clearCart();
    }
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (Array.isArray(user)) {
      return user.includes(role);
    }
    return user?.roles?.includes(role) || false;
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  updateCurrentUser(userData: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(userData));
      this.currentUserSubject.next(userData);
    }
  }

  updatePassword(currentPassword: string, newPassword: string): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('Non authentifié'));
    }

    return this.http.post<any>(
      'http://localhost:8080/api/auth/update-password',
      { currentPassword, newPassword },
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        })
      }
    ).pipe(
      tap(response => {
        if (response.token) {
          // Mettre à jour le token
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token);
          }
        }
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        return throwError(() => error);
      })
    );
  }
}