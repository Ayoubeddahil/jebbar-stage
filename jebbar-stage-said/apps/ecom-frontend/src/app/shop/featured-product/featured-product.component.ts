import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../admin/model/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'ecom-featured-product',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, FaIconComponent, FontAwesomeModule],
  templateUrl: './featured-product.component.html',
  styleUrl: './featured-product.component.scss',
})
export class FeaturedProductComponent {
  products = input.required<Product[]>();
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  currentIndex = 0;

  nextSlide() {
    if (this.products().length > 4) {
      this.currentIndex = (this.currentIndex + 1) % Math.ceil(this.products().length / 4);
    }
  }

  previousSlide() {
    if (this.products().length > 4) {
      this.currentIndex = (this.currentIndex - 1 + Math.ceil(this.products().length / 4)) % Math.ceil(this.products().length / 4);
    }
  }

  getVisibleProducts() {
    const startIndex = this.currentIndex * 4;
    return this.products().slice(startIndex, startIndex + 4);
  }
} 