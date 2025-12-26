import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface GuideProfile {
  id: string;
  guideEmail: string;
  guideName: string;
  fullName: string;
  phoneNumber: string;
  attractionId: string;
  attractionName: string;
  location: string;
  hourlyRate: number;
  tourDuration: number;
  languages: string;
  experienceYears?: number;
  availableDates: AvailableDateRange[];
  profilePicture?: string;
  bio?: string;
  specialties?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGuideProfileDto {
  guideName: string;
  guideEmail: string;
  fullName: string;
  phoneNumber: string;
  attractionId: string;
  attractionName: string;
  location: string;
  hourlyRate: number;
  tourDuration: number;
  languages: string;
  experienceYears?: number;
  availableDates: AvailableDateRange[];
  profilePicture?: string;
  bio?: string;
  specialties?: string[];
}

export interface AvailableDateRange {
  from: string;
  to: string;
}

export interface UpdateGuideProfileDto {
  guideName?: string;
  hourlyRate?: number;
  tourDuration?: number;
  languages?: string[];
  experienceYears?: number;
  availableDates?: AvailableDateRange[];
  profilePicture?: string;
  bio?: string;
  specialties?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GuideProfileService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Get all guide profiles for a specific guide email
   */
  getGuideProfiles(guideEmail: string): Observable<GuideProfile[]> {
    return this.http.get<GuideProfile[]>(`${this.apiUrl}/guides/profile`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching guide profiles:', error);
          throw new Error('Guide Profiles Fetch Failed');
          // return this.getLocalGuideProfiles(guideEmail);
        })
      );
  }

  /**
   * Get guides for a specific attraction
   */
  getGuidesByAttraction(attractionId: string): Observable<GuideProfile[]> {
    return this.http.get<GuideProfile[]>(`${this.apiUrl}/by-attraction/${attractionId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching guides by attraction:', error);
          return of([]);
        })
      );
  }

  /**
   * Create a new guide profile
   */
  createGuideProfile(profile: CreateGuideProfileDto): Observable<GuideProfile> {
    return this.http.post<GuideProfile>(`${this.apiUrl}/guides/profile`, profile, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error creating guide profile:', error);
          throw new Error('Guide Profile Creation Failed');
          // return this.createLocalGuideProfile(profile);
        })
      );
  }

  /**
   * Update an existing guide profile
   */
  updateGuideProfile(id: string, profile: UpdateGuideProfileDto): Observable<GuideProfile> {
    return this.http.put<GuideProfile>(`${this.apiUrl}/guides/profile`, profile, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error updating guide profile:', error);
          return of({} as GuideProfile);
        })
      );
  }

  /**
   * Delete a guide profile
   */
  deleteGuideProfile(id: string, guideEmail: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error deleting guide profile:', error);
          // return this.deleteLocalGuideProfile(id, guideEmail);
          throw new Error('Guide Profile Deletion Failed');
        })
      );
  }

  // ============== LOCAL STORAGE FALLBACK METHODS ==============

  private getLocalGuideProfiles(guideEmail: string): Observable<GuideProfile[]> {
    const saved = localStorage.getItem('guide_profiles_' + guideEmail);
    const profiles = saved ? JSON.parse(saved) : [];
    return of(profiles);
  }

  private createLocalGuideProfile(profile: CreateGuideProfileDto): Observable<GuideProfile> {
    const saved = localStorage.getItem('guide_profiles_' + profile.guideEmail);
    const profiles: GuideProfile[] = saved ? JSON.parse(saved) : [];
    
    const newProfile: GuideProfile = {
      id: 'gp-' + Date.now().toString(),
      ...profile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    profiles.push(newProfile);
    localStorage.setItem('guide_profiles_' + profile.guideEmail, JSON.stringify(profiles));
    
    return of(newProfile);
  }

  private deleteLocalGuideProfile(id: string, guideEmail: string): Observable<boolean> {
    const saved = localStorage.getItem('guide_profiles_' + guideEmail);
    if (saved) {
      const profiles: GuideProfile[] = JSON.parse(saved);
      const filtered = profiles.filter(p => p.id !== id);
      localStorage.setItem('guide_profiles_' + guideEmail, JSON.stringify(filtered));
    }
    return of(true);
  }
}
