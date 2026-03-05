import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/request-list/request-list.component').then(m => m.RequestListComponent),
  },
  {
    path: 'request/:reqid',
    canActivate: [authGuard],
    loadComponent: () => import('./components/request-detail/request-detail.component').then(m => m.RequestDetailComponent),
  },
  {
    path: 'scripts',
    canActivate: [authGuard],
    loadComponent: () => import('./components/script-list/script-list.component').then(m => m.ScriptListComponent),
  },
  {
    path: 'categories',
    canActivate: [authGuard],
    loadComponent: () => import('./components/category-view/category-view.component').then(m => m.CategoryViewComponent),
  },
  { path: '**', redirectTo: '' },
];
