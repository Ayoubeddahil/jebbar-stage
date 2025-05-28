import { Component, effect, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService } from '../cart.service';
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CartItem, CartItemAdd, StripeSession } from '../cart.model';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { RouterLink, Router } from '@angular/router';
import { StripeService } from 'ngx-stripe';

@Component({
  selector: 'ecom-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  authService = inject(AuthService);
  toastService = inject(ToastService);
  stripeService = inject(StripeService);
  router = inject(Router);

  cart: Array<CartItem> = [];
  platformId = inject(PLATFORM_ID);
  labelCheckout = 'Login to checkout';
  action: 'login' | 'checkout' = 'login';
  isInitPaymentSessionLoading = false;

  cartQuery = injectQuery(() => ({
    queryKey: ['cart'],
    queryFn: () => lastValueFrom(this.cartService.getCartDetail()),
  }));

  initPaymentSession = injectMutation(() => ({
    mutationFn: (cart: Array<CartItemAdd>) =>
      lastValueFrom(this.cartService.initPaymentSession(cart)),
    onSuccess: (result: StripeSession) => this.onSessionCreateSuccess(result),
  }));

  constructor() {
    effect(() => {
      const result = this.cartQuery.data();
      if (result) {
        this.cart = result.products;
      }
    });
    this.checkUserLoggedIn();
  }

  private checkUserLoggedIn() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.labelCheckout = 'Checkout';
        this.action = 'checkout';
      } else {
        this.labelCheckout = 'Login to checkout';
        this.action = 'login';
      }
    });
  }

  checkout() {
    if (this.action === 'login') {
      this.router.navigate(['/login']);
    } else if (this.action === 'checkout') {
      this.isInitPaymentSessionLoading = true;
      const cartItemsAdd = this.cart.map(
        (item) =>
          ({ publicId: item.publicId, quantity: item.quantity } as CartItemAdd)
      );
      this.initPaymentSession.mutate(cartItemsAdd);
    }
  }

  private onSessionCreateSuccess(result: StripeSession) {
    this.isInitPaymentSessionLoading = false;
    this.cartService.storeSessionId(result.id);
    this.stripeService.redirectToCheckout({ sessionId: result.id });
  }

  ngOnInit(): void {
    this.cartService.addedToCart.subscribe((cart) => this.updateQuantity(cart));
  }

  private updateQuantity(cartUpdated: Array<CartItemAdd>) {
    for (const cartItemToUpdate of this.cart) {
      const itemToUpdate = cartUpdated.find(
        (item) => item.publicId === cartItemToUpdate.publicId
      );
      if (itemToUpdate) {
        cartItemToUpdate.quantity = itemToUpdate.quantity;
      } else {
        this.cart.splice(this.cart.indexOf(cartItemToUpdate), 1);
      }
    }
  }

  addQuantityToCart(publicId: string) {
    this.cartService.addToCart(publicId, 'add');
  }

  removeQuantityToCart(publicId: string, quantity: number) {
    if (quantity > 1) {
      this.cartService.addToCart(publicId, 'remove');
    }
  }

  removeItem(publicId: string) {
    const itemToRemoveIndex = this.cart.findIndex(
      (item) => item.publicId === publicId
    );
    if (itemToRemoveIndex) {
      this.cart.splice(itemToRemoveIndex, 1);
    }
    this.cartService.removeFromCart(publicId);
  }

  computeTotal() {
    return this.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  checkIfEmptyCart(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return (
        this.cartQuery.isSuccess() &&
        this.cartQuery.data().products.length === 0
      );
    } else {
      return false;
    }
  }
}
