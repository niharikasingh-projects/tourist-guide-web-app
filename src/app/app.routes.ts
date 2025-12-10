import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', redirectTo: 'signin', pathMatch: 'full' },
	{ path: 'signin', loadComponent: () => import('./auth/signin.component').then(m => m.SigninComponent) },
	{ path: 'signup', loadComponent: () => import('./auth/signup.component').then(m => m.SignupComponent) },
	{ path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
	{ path: 'attraction/:id', loadComponent: () => import('./search/attraction-details/attraction-details.component').then(m => m.AttractionDetailsComponent) },
	{ path: 'checkout/:attractionId/:guideId', loadComponent: () => import('./booking/checkout/checkout.component').then(m => m.CheckoutComponent) },
	{ path: 'booking-confirmation/:bookingId', loadComponent: () => import('./booking/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent) },
	{ path: 'my-bookings', loadComponent: () => import('./booking/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent) },
	{ path: 'profile', loadComponent: () => import('./user/profile/profile.component').then(m => m.ProfileComponent) },
	{ path: '**', redirectTo: 'signin' },
];
