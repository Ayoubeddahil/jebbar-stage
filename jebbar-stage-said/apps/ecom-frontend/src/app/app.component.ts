import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FaConfig,
  FaIconComponent,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { fontAwesomeIcons } from './shared/font-awesome-icons';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { AuthService } from './auth/auth.service';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { ToastService } from './shared/toast/toast.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    FaIconComponent,
    NavbarComponent,
    FooterComponent,
    NgClass,
  ],
  selector: 'ecom-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private faIconLibrary = inject(FaIconLibrary);
  private faConfig = inject(FaConfig);
  private router = inject(Router);
  private authService = inject(AuthService);
  toastService = inject(ToastService);
  route = inject(ActivatedRoute);
  platformId = inject(PLATFORM_ID);

  constructor(public r: Router) {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize authentication state
      if (this.authService.isAuthenticated()) {
        console.log('User is authenticated');
      } else {
        console.log('User is not authenticated');
      }
    }
  }

  ngOnInit(): void {
    this.initFontAwesome();
  }


  private initFontAwesome() {
    this.faConfig.defaultPrefix = 'far';
    this.faIconLibrary.addIcons(...fontAwesomeIcons);
  }

  shouldShowLayout(): boolean {
    // liste des routes SANS navbar/footer
    const hiddenRoutes = ['/login', '/register'];
    return !hiddenRoutes.includes(this.r.url);
  }
}
