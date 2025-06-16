import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './user/user-list/user-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'users', component: UserListComponent },
      { path: '', redirectTo: 'products', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    UserListComponent
  ]
})
export class AdminModule { } 