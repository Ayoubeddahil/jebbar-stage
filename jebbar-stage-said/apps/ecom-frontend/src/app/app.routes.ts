import { Route } from '@angular/router';
import { AdminCategoriesComponent } from './admin/category/admin-categories/admin-categories.component';
import { CreateCategoryComponent } from './admin/category/create-category/create-category.component';
import { roleCheckGuard } from './auth/role-check.guard';
import { CreateProductComponent } from './admin/product/create-product/create-product.component';
import { AdminProductsComponent } from './admin/product/admin-products/admin-products.component';
import { HomeComponent } from './home/home.component';
import { ProductDetailComponent } from './shop/product-detail/product-detail.component';
import { ProductsComponent } from './shop/products/products.component';
import { CartComponent } from './shop/cart/cart.component';
import { CartSuccessComponent } from './shop/cart-success/cart-success.component';
import { UserOrdersComponent } from './user/user-orders/user-orders.component';
import { AdminOrdersComponent } from './admin/admin-orders/admin-orders.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { ContactComponent } from './contact/contact.component';
import { UserListComponent } from './features/admin/user/user-list/user-list.component';
// import { HomepageComponent } from './homepage/homepage.component';
export const appRoutes: Route[] = [
  {
    path: 'admin/categories/list',
    component: AdminCategoriesComponent,
    canActivate: [roleCheckGuard],
    data: {
      authorities: ['ROLE_ADMIN'],
    },
  },
  {
    path: 'admin/categories/create',
    component: CreateCategoryComponent,
    canActivate: [roleCheckGuard],
    data: {
      authorities: ['ROLE_ADMIN'],
    },
  },
  {
    path: 'admin/products/create',
    component: CreateProductComponent,
    canActivate: [roleCheckGuard],
    data: {
      authorities: ['ROLE_ADMIN'],
    },
  },
  {
    path: 'admin/products/list',
    component: AdminProductsComponent,
    canActivate: [roleCheckGuard],
    data: {
      authorities: ['ROLE_ADMIN'],
    },
  },
  {
    path: 'admin/orders/list',
    component: AdminOrdersComponent,
    canActivate: [roleCheckGuard],
    data: {
      authorities: ['ROLE_ADMIN'],
    },
  },
  {
    path: 'admin/users',
    component: UserListComponent,
    canActivate: [roleCheckGuard],
    data: {
      authorities: ['ROLE_ADMIN'],
    },
  },
  {
    path: '',
    component: HomeComponent,
  },
  // {
  //   path: '',
  //   component: HomepageComponent,
  // },
  {
    path: 'product/:publicId',
    component: ProductDetailComponent,
  },
  {
    path: 'products',
    component: ProductsComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'cart/success',
    component: CartSuccessComponent,
  },
  {
    path: 'users/orders',
    component: UserOrdersComponent
  },
  {
    path: 'users/profile',
    component: UserProfileComponent
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'contact', component: ContactComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

export const routes = appRoutes;