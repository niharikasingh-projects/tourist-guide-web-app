import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, timeout } from 'rxjs/operators';
import { of, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  name: string;
  email: string;
  password: string;
  role?: string;
  languages?: string;
  profilePicture?: string;
  location?: string;
  phoneNumber?: string;
  certifications?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  
  private users: User[] = [
    { name: 'admin@gmail.com', email: 'admin@gmail.com', password: '123', role: 'admin' },
    { name: 'guide@gmail.com', email: 'guide@gmail.com', password: '123', role: 'guide' },
    { name: 'user@gmail.com', email: 'user@gmail.com', password: '123', role: 'user' }
  ];
  private currentUser: User | null = null;

  constructor(private router: Router) {
    try {
      const raw = localStorage.getItem('auth_user');
      if (raw) this.currentUser = JSON.parse(raw) as User;
    } catch {}
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Simulate async network calls (small delay) so components can show loading states
  async signIn(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      // Try backend API first
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; message?: string; user?: User }>(
          `${this.apiUrl}/api/auth/signin`,
          { email, password }
        ).pipe(
          //timeout(5000), // 5 second timeout
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend signin failed, falling back to local auth:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success) {
        this.currentUser = response.user!;
        try { 
          localStorage.setItem('auth_user', JSON.stringify(response.user));
          // Store token if provided by backend
          if ((response as any).token) {
            localStorage.setItem('authToken', (response as any).token);
          }
        } catch {}
        return response;
      }
    } catch (error) {
      console.warn('Backend signin error, using fallback:', error);
    }

    // Fallback to local authentication
    await this.delay(600);
    const user = this.users.find(u => u.name === email || u.email === email);
    if (!user) return { success: false, message: 'User not found' };
    if (user.password !== password) return { success: false, message: 'Invalid password' };
    this.currentUser = user;
    try { 
      localStorage.setItem('auth_user', JSON.stringify(user));
      // Generate a mock token for local development
      const mockToken = 'mock-token-' + btoa(user.email + ':' + Date.now());
      localStorage.setItem('authToken', mockToken);
    } catch {}
    return { success: true, user };
  }

  async signUp(newUser: User, profilePictureFile?: File): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      // Try backend API first
      const formData = new FormData();
      formData.append('name', newUser.name);
      formData.append('email', newUser.email);
      formData.append('password', newUser.password);
      
      if (newUser.role) formData.append('role', newUser.role);
      if (newUser.languages) formData.append('languages', newUser.languages);
      if (newUser.location) formData.append('location', newUser.location);
      if (newUser.phoneNumber) formData.append('phoneNumber', newUser.phoneNumber);
      if (newUser.certifications) formData.append('certifications', newUser.certifications);
      
      // Append profile picture file if provided
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile, profilePictureFile.name);
      } else if (newUser.profilePicture) {
        // If profilePicture is a URL string, send it as is
        formData.append('profilePicture', newUser.profilePicture);
      }

      const response = await firstValueFrom(
        this.http.post<{ success: boolean; message?: string; user?: User }>(
          `${this.apiUrl}/api/auth/signup`,
          formData,
          {
            headers: {
              'Accept': 'application/json'
              // Note: Don't set Content-Type for FormData - browser will set it with boundary
            }
          }
        ).pipe(
          timeout(5000), // 5 second timeout
          catchError((error: HttpErrorResponse) => {
            console.warn('Backend signup failed, falling back to local auth:', error.message);
            return of(null);
          })
        )
      );

      if (response && response.success) {
        return response;
      }
    } catch (error) {
      console.warn('Backend signup error, using fallback:', error);
    }

    // Fallback to local authentication
    await this.delay(700);
    const exists = this.users.find(u => u.name === newUser.name || u.email === newUser.email);
    if (exists) return { success: false, message: 'User already exists' };
    this.users.push(newUser);
    return { success: true, user: newUser };
  }

  listUsers() {
    return this.users.slice();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  signOut(): void {
    this.currentUser = null;
    try { 
      localStorage.removeItem('auth_user');
      localStorage.removeItem('authToken');
    } catch {}
    try { this.router.navigate(['/signin']); } catch {}
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
