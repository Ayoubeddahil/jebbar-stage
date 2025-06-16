import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserProductService } from '../shared/service/user-product.service';
import { ProductCategory } from '../admin/model/product.model';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FeaturedProductComponent } from '../shop/featured-product/featured-product.component';

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

@Component({
  selector: 'ecom-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, FeaturedProductComponent, FaIconComponent, FontAwesomeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  currentSlide = 1;
  totalSlides = 4;
  private slideInterval: any;
  private isBrowser: boolean;
  firstCategoryId: string | null = null;
  isVideoPlaying = true;

  private router = inject(Router);
  private productService = inject(UserProductService);

  // Font Awesome icons
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  carouselSlides: CarouselSlide[] = [
    {
      id: 1,
      image: './home/banner1.jpg',
      title: 'Solutions Robotiques Innovantes',
      description: 'Transformez votre production avec nos solutions d\'automatisation de pointe',
      buttonText: 'Découvrir nos solutions',
      buttonLink: '/shop'
    },
    {
      id: 2,
      image: './home/banner2.jpg',
      title: 'Expertise Technique',
      description: 'Une équipe d\'experts à votre service pour des solutions sur mesure',
      buttonText: 'Nos produits',
      buttonLink: '/shop'
    },
    {
      id: 3,
      image: './home/banner3.jpg',
      title: 'Innovation Continue',
      description: 'Restez à la pointe de la technologie avec nos solutions évolutives',
      buttonText: 'Voir nos solutions',
      buttonLink: '/shop'
    },
    {
      id: 4,
      image: './home/banner1.jpg',
      title: 'Solutions Industrielles',
      description: 'Optimisez votre production avec nos solutions robotiques avancées',
      buttonText: 'Explorer nos produits',
      buttonLink: '/shop'
    }
  ];

  featuredProductQuery = injectQuery(() => ({
    queryKey: ['featured-products'],
    queryFn: () => lastValueFrom(this.productService.findAllFeaturedProducts({ page: 0, size: 20, sort: [] }))
  }));

  featuredProducts = () => this.featuredProductQuery.data()?.content || [];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.startCarousel();
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
    if (this.videoPlayer) {
        const video = this.videoPlayer.nativeElement;
        video.muted = true;
        video.play().catch(error => {
          console.log('Autoplay prevented:', error);
          document.addEventListener('click', () => {
            video.play();
          }, { once: true });
        });
      }
    }
  }

  navigateToFirstCategory() {
    if (this.categoryQuery.isSuccess() && this.categoryQuery.data()?.content.length > 0) {
      const firstCategory = this.categoryQuery.data()!.content[0];
      this.router.navigate(['/products'], {
        queryParams: {
          category: firstCategory.publicId
        }
      });
    } else {
      this.router.navigate(['/products']);
    }
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startSlideshow() {
    this.slideInterval = setInterval(() => {
      this.goToSlide(this.currentSlide % this.totalSlides + 1);
    }, 5000);
  }

  goToSlide(slideNumber: number) {
      this.currentSlide = slideNumber;
  }

  navigateToProducts() {
    this.router.navigate(['/products']);
  }

  navigateToContact() {
    this.router.navigate(['/contact']);
  }

  categoryQuery = injectQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => lastValueFrom(this.productService.findAllCategories()),
  }));

  private startCarousel(): void {
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 1 ? this.carouselSlides.length : this.currentSlide - 1;
  }

  nextSlide(): void {
    this.currentSlide = this.currentSlide === this.carouselSlides.length ? 1 : this.currentSlide + 1;
  }
}