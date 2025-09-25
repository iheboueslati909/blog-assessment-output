import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) 
  },
  {
    path: 'articles',
    canActivate: [authGuard],
    children: [
      // List articles - any authenticated user
      { 
        path: '', 
        loadComponent: () => import('./components/article/article-list.component').then(m => m.ArticleListComponent) 
      },
      // Create new article - any authenticated user
      { 
        path: 'new', 
        loadComponent: () => import('./components/article/article-form.component').then(m => m.ArticleFormComponent) 
      },
      // View article details - any authenticated user
      { 
        path: ':id', 
        loadComponent: () => import('./components/article/article-detail.component').then(m => m.ArticleDetailComponent) 
      },
      // Edit article - only Editor or Admin
      { 
        path: ':id/edit', 
        loadComponent: () => import('./components/article/article-form.component').then(m => m.ArticleFormComponent),
        canActivate: [authGuard],
        data: { roles: ['Editor', 'Admin'] }
      }
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
    children: [
      {
        path: 'users',
        loadComponent: () => import('./components/user/manage-users.component').then(m => m.ManageUsersComponent)
      }
    ]
  },
  { path: '', redirectTo: '/articles', pathMatch: 'full' },
  { path: '**', redirectTo: '/articles' }
];
