import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-lg">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <a routerLink="/" class="text-xl font-bold">E-Commerce</a>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Menu Administration -->
            <div class="relative group">
              <button class="text-gray-700 hover:text-gray-900 flex items-center">
                Administration
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Menu déroulant -->
              <div class="absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl hidden group-hover:block z-50">
                <a routerLink="/admin/products" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Produits
                </a>
                <a routerLink="/admin/categories" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Catégories
                </a>
                <a routerLink="/admin/orders" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Commandes
                </a>
                <a routerLink="/admin/users" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Utilisateurs
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NavbarComponent {} 