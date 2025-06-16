import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Cart, CartItemAdd, StripeSession } from './cart.model';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  platformId = inject(PLATFORM_ID);
  http = inject(HttpClient);
  private authService = inject(AuthService);

  private keyCartStorage = 'cart';
  private keySessionId = 'stripe-session-id';
  private lastUser: string | null = null;

  private addedToCart$ = new BehaviorSubject<Array<CartItemAdd>>([]);
  addedToCart = this.addedToCart$.asObservable();

  constructor() {
    // Initialize with empty cart
    this.addedToCart$.next([]);
    if (isPlatformBrowser(this.platformId)) {
      this.loadCartForCurrentUser();
      
      // Check for user changes periodically
      setInterval(() => {
        const currentUser = this.getCurrentUsername();
        if (currentUser !== this.lastUser) {
          this.lastUser = currentUser;
          this.loadCartForCurrentUser();
        }
      }, 1000);
    }
  }

  private getCurrentUsername(): string | null {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.username;
      } catch {
        return null;
      }
    }
    return null;
  }

  private getCartKey(): string {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return `${this.keyCartStorage}_${userData.username}`;
      } catch {
        return this.keyCartStorage;
      }
    }
    return this.keyCartStorage;
  }

  private loadCartForCurrentUser(): void {
    const cartProducts = localStorage.getItem(this.getCartKey());
    if (cartProducts) {
      try {
        const parsedCart = JSON.parse(cartProducts) as CartItemAdd[];
        this.addedToCart$.next(Array.isArray(parsedCart) ? parsedCart : []);
      } catch {
        this.addedToCart$.next([]);
      }
    } else {
      this.addedToCart$.next([]);
    }
  }

  refreshCart(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCartForCurrentUser();
    }
  }

  private getCartFromLocalStorage(): Array<CartItemAdd> {
    if (isPlatformBrowser(this.platformId)) {
      const cartProducts = localStorage.getItem(this.getCartKey());
      if (cartProducts) {
        try {
          const parsedCart = JSON.parse(cartProducts) as CartItemAdd[];
          return Array.isArray(parsedCart) ? parsedCart : [];
        } catch {
          return [];
        }
      }
    }
    return [];
  }

  addToCart(publicId: string, command: 'add' | 'remove'): void {
    if (isPlatformBrowser(this.platformId)) {
      const itemToAdd: CartItemAdd = { publicId, quantity: 1 };
      const cartFromLocalStorage = this.getCartFromLocalStorage();
      if (cartFromLocalStorage.length !== 0) {
        const productExist = cartFromLocalStorage.find(
          (item) => item.publicId === publicId
        );
        if (productExist) {
          if (command === 'add') {
            productExist.quantity++;
          } else if (command === 'remove' && productExist.quantity > 1) {
            productExist.quantity--;
          }
        } else {
          cartFromLocalStorage.push(itemToAdd);
        }
      } else {
        cartFromLocalStorage.push(itemToAdd);
      }
      localStorage.setItem(
        this.getCartKey(),
        JSON.stringify(cartFromLocalStorage)
      );
      this.addedToCart$.next(cartFromLocalStorage);
    }
  }

  removeFromCart(publicId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const cartFromLocalStorage = this.getCartFromLocalStorage();
      const productExist = cartFromLocalStorage.find(
        (item) => item.publicId === publicId
      );
      if (productExist) {
        cartFromLocalStorage.splice(
          cartFromLocalStorage.indexOf(productExist),
          1
        );
        localStorage.setItem(
          this.getCartKey(),
          JSON.stringify(cartFromLocalStorage)
        );
        this.addedToCart$.next(cartFromLocalStorage);
      }
    }
  }

  getCartDetail(): Observable<Cart> {
    const cartFromLocalStorage = this.getCartFromLocalStorage();
    const publicIdsForURL = cartFromLocalStorage.reduce(
      (acc, item) => `${acc}${acc.length > 0 ? ',' : ''}${item.publicId}`,
      ''
    );
    return this.http
      .get<Cart>(`${environment.apiUrl}/orders/get-cart-details`, {
        params: { productIds: publicIdsForURL },
      })
      .pipe(map((cart) => this.mapQuantity(cart, cartFromLocalStorage)));
  }

  private mapQuantity(
    cart: Cart,
    cartFromLocalStorage: Array<CartItemAdd>
  ): Cart {
    for (const cartItem of cartFromLocalStorage) {
      const foundProduct = cart.products.find(
        (item) => item.publicId === cartItem.publicId
      );
      if (foundProduct) {
        foundProduct.quantity = cartItem.quantity;
      }
    }
    return cart;
  }

  initPaymentSession(cart: Array<CartItemAdd>): Observable<StripeSession> {
    return this.http.post<StripeSession>(
      `${environment.apiUrl}/orders/init-payment`,
      cart
    );
  }

  storeSessionId(sessionId: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.keySessionId, sessionId);
    }
  }

  getSessionId(): string {
    if (isPlatformBrowser(this.platformId)) {
      const stripeSessionId = localStorage.getItem(this.keySessionId);
      if (stripeSessionId) {
        return stripeSessionId;
      }
    }
    return '';
  }

  deleteSessionId(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.keySessionId);
    }
  }

  clearCart() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.getCartKey());
      this.addedToCart$.next([]);
    }
  }
}
