import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface UserProfile {
  name: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  country: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly PROFILE_STORAGE_KEY = 'tourist_guide_user_profile';

  constructor(private authService: AuthService) {}

  getUserProfile(): Observable<UserProfile | null> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of(null);
    }

    try {
      const storedProfile = localStorage.getItem(this.PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const profiles: { [email: string]: UserProfile } = JSON.parse(storedProfile);
        const profile = profiles[currentUser.email];
        if (profile) {
          return of(profile).pipe(delay(100));
        }
      }

      // Return default profile if none exists
      const defaultProfile: UserProfile = {
        name: currentUser.username,
        email: currentUser.email,
        dateOfBirth: '',
        phoneNumber: '',
        country: ''
      };
      return of(defaultProfile).pipe(delay(300));
    } catch (error) {
      console.error('Error loading profile:', error);
      return of(null);
    }
  }

  updateUserProfile(profile: UserProfile): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of(false);
    }

    try {
      let profiles: { [email: string]: UserProfile } = {};
      const storedProfile = localStorage.getItem(this.PROFILE_STORAGE_KEY);
      if (storedProfile) {
        profiles = JSON.parse(storedProfile);
      }

      profiles[currentUser.email] = profile;
      localStorage.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(profiles));
      return of(true).pipe(delay(400));
    } catch (error) {
      console.error('Error saving profile:', error);
      return of(false);
    }
  }

  clearUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    try {
      const storedProfile = localStorage.getItem(this.PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const profiles: { [email: string]: UserProfile } = JSON.parse(storedProfile);
        delete profiles[currentUser.email];
        localStorage.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(profiles));
      }
    } catch (error) {
      console.error('Error clearing profile:', error);
    }
  }
}
