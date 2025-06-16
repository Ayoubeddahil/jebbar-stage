import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../admin/model/product.model';
import { RouterLink } from '@angular/router';
import { CartService } from '../cart.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'ecom-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FaIconComponent, FontAwesomeModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<Product>();
  faPlus = faPlus;
  
  constructor(private cartService: CartService) {}

  addToCart(product: Product) {
    this.cartService.addToCart(product.publicId, 'add');
  }
}
