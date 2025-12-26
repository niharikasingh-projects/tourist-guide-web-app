import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

export interface UserProfile {
  name: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  country: string;
  location?: string;
  languages?: string;
  certifications?: string;
  profileImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly PROFILE_STORAGE_KEY = 'tourist_guide_user_profile';
  private apiUrl = `${environment.apiUrl}/api/profile`;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getUserProfile(): Observable<UserProfile | null> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of(null);
    }

    // Call backend API first
    return this.http.get<UserProfile>(`${environment.apiUrl}/api/users/${encodeURIComponent(currentUser?.id ?? '')}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching profile from backend:', error);
          throw new Error('Failed to fetch profile from backend');
          // return this.getLocalProfile(currentUser.email, currentUser.name);
        })
      );
  }

  private getLocalProfile(email: string, name: string): Observable<UserProfile | null> {
    try {
      const storedProfile = localStorage.getItem(this.PROFILE_STORAGE_KEY);
      if (storedProfile) {
        const profiles: { [email: string]: UserProfile } = JSON.parse(storedProfile);
        const profile = profiles[email];
        if (profile) {
          return of(profile).pipe(delay(100));
        }
      }

      // Return default profile if none exists
      const defaultProfile: UserProfile = {
        name: name,
        email: email,
        dateOfBirth: '',
        phoneNumber: '',
        country: '',
        location: '',
        languages: '',
        certifications: '',
        profileImageUrl: ''
      };
      return of(defaultProfile).pipe(delay(300));
    } catch (error) {
      console.error('Error loading local profile:', error);
      return of(null);
    }
  }

  updateUserProfile(profile: UserProfile, userPictureFile?: File): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of(false);
    }
    const formData = new FormData();

    if (profile.name) formData.append('name', profile.name);
    if (profile.email) formData.append('email', profile.email);
    if (profile.dateOfBirth) formData.append('dateOfBirth', profile.dateOfBirth);
    if (profile.phoneNumber) formData.append('phoneNumber', profile.phoneNumber);
    if (profile.country) formData.append('country', profile.country);
    if (profile.location) formData.append('location', profile.location);
    if (profile.languages) formData.append('languages', profile.languages);
    if (profile.certifications) formData.append('certifications', profile.certifications);
    // Removed appending profileImageUrl from profile object since it will be handled by userPictureFile

    if (userPictureFile) {
      formData.append('profileImageUrl', userPictureFile, userPictureFile.name);
    } 
    // Call backend API first
    return this.http.put<UserProfile>(`${environment.apiUrl}/api/users/profile`, formData, { headers: this.getAuthHeaders() })
      .pipe(
        map(() => {
          // Save to local storage as backup
          // this.saveToLocalStorage(profile);
          return true;
        }),
        catchError(error => {
          console.error('Error updating profile in backend:', error);
          throw new Error('Failed to update profile in backend');
          // Fallback to local storage
          // return this.updateLocalProfile(profile);
        })
      );
  }

  private updateLocalProfile(profile: UserProfile): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of(false);
    }

    try {
      this.saveToLocalStorage(profile);
      return of(true).pipe(delay(400));
    } catch (error) {
      console.error('Error saving profile locally:', error);
      return of(false);
    }
  }

  private saveToLocalStorage(profile: UserProfile): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    try {
      let profiles: { [email: string]: UserProfile } = {};
      const storedProfile = localStorage.getItem(this.PROFILE_STORAGE_KEY);
      if (storedProfile) {
        profiles = JSON.parse(storedProfile);
      }
      profiles[currentUser.email] = profile;
      localStorage.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
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
