import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', redirectTo: 'signin', pathMatch: 'full' },
	{ path: 'signin', loadComponent: () => import('./auth/signin.component').then(m => m.SigninComponent) },
	{ path: 'signup', loadComponent: () => import('./auth/signup.component').then(m => m.SignupComponent) },
	{ path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
	{ path: '**', redirectTo: 'signin' },
];
