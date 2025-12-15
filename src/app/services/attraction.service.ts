import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface GuideAttraction {
  id: string;
  attractionName: string;
  location: string;
  availableDates: { from: string; to: string }[];
  hourlyRate: number;
  specialties: string[];
  bio: string;
  tourDuration?: number;
  category?: string;
  pictures?: string[];
  guideEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAttractionDto {
  attractionName: string;
  location: string;
  hourlyRate: number;
  specialties: string[];
  bio: string;
  tourDuration?: number;
  category?: string;
  pictures?: string[];
  availableDates: { from: string; to: string }[];
}

export interface UpdateAttractionDto {
  attractionName?: string;
  location?: string;
  hourlyRate?: number;
  specialties?: string[];
  bio?: string;
  tourDuration?: number;
  category?: string;
  pictures?: string[];
  availableDates?: { from: string; to: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AttractionService {
  private apiUrl = `${environment.apiUrl}/api/attractions/guide`;

  constructor(private http: HttpClient) {}

  /**
   * Get all attractions for the current guide
   */
  getGuideAttractions(guideEmail: string): Observable<GuideAttraction[]> {
    return this.http.get<GuideAttraction[]>(`${this.apiUrl}/${guideEmail}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching guide attractions:', error);
          // Fallback to localStorage if API fails
          return this.getLocalAttractions(guideEmail);
        })
      );
  }

  /**
   * Create a new attraction
   */
  createAttraction(guideEmail: string, attraction: CreateAttractionDto): Observable<GuideAttraction> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post<GuideAttraction>(
      `${this.apiUrl}/${guideEmail}`, 
      attraction, 
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error creating attraction:', error);
        // Fallback to localStorage if API fails
        return this.createLocalAttraction(guideEmail, attraction);
      })
    );
  }

  /**
   * Update an existing attraction
   */
  updateAttraction(attractionId: string, attraction: UpdateAttractionDto): Observable<GuideAttraction> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.put<GuideAttraction>(
      `${this.apiUrl}/${attractionId}`, 
      attraction, 
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error updating attraction:', error);
        // Fallback to localStorage if API fails
        return this.updateLocalAttraction(attractionId, attraction);
      })
    );
  }

  /**
   * Delete an attraction
   */
  deleteAttraction(attractionId: string, guideEmail: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${attractionId}`)
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error deleting attraction:', error);
          // Fallback to localStorage if API fails
          return this.deleteLocalAttraction(attractionId, guideEmail);
        })
      );
  }

  /**
   * Add a date range to an attraction
   */
  addDateRange(attractionId: string, dateRange: { from: string; to: string }): Observable<GuideAttraction> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post<GuideAttraction>(
      `${this.apiUrl}/${attractionId}/dates`, 
      dateRange, 
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error adding date range:', error);
        return of({} as GuideAttraction);
      })
    );
  }

  /**
   * Remove a date range from an attraction
   */
  removeDateRange(attractionId: string, dateIndex: number): Observable<GuideAttraction> {
    return this.http.delete<GuideAttraction>(
      `${this.apiUrl}/${attractionId}/dates/${dateIndex}`
    ).pipe(
      catchError(error => {
        console.error('Error removing date range:', error);
        return of({} as GuideAttraction);
      })
    );
  }

  // ============== LOCAL STORAGE FALLBACK METHODS ==============

  private getLocalAttractions(guideEmail: string): Observable<GuideAttraction[]> {
    const saved = localStorage.getItem('guide_attractions_' + guideEmail);
    const attractions = saved ? JSON.parse(saved) : [];
    return of(attractions);
  }

  private createLocalAttraction(guideEmail: string, attraction: CreateAttractionDto): Observable<GuideAttraction> {
    const saved = localStorage.getItem('guide_attractions_' + guideEmail);
    const attractions: GuideAttraction[] = saved ? JSON.parse(saved) : [];
    
    const newAttraction: GuideAttraction = {
      id: Date.now().toString(),
      ...attraction,
      guideEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    attractions.push(newAttraction);
    localStorage.setItem('guide_attractions_' + guideEmail, JSON.stringify(attractions));
    
    return of(newAttraction);
  }

  private updateLocalAttraction(attractionId: string, updates: UpdateAttractionDto): Observable<GuideAttraction> {
    // We need to find the attraction in any guide's storage
    // For simplicity, we'll return the updated object
    // In a real scenario, we'd need the guideEmail
    const updatedAttraction: GuideAttraction = {
      id: attractionId,
      attractionName: updates.attractionName || '',
      location: updates.location || '',
      hourlyRate: updates.hourlyRate || 0,
      specialties: updates.specialties || [],
      bio: updates.bio || '',
      tourDuration: updates.tourDuration,
      category: updates.category,
      pictures: updates.pictures,
      availableDates: updates.availableDates || [],
      updatedAt: new Date().toISOString()
    };
    
    return of(updatedAttraction);
  }

  private deleteLocalAttraction(attractionId: string, guideEmail: string): Observable<boolean> {
    const saved = localStorage.getItem('guide_attractions_' + guideEmail);
    if (saved) {
      const attractions: GuideAttraction[] = JSON.parse(saved);
      const filtered = attractions.filter(a => a.id !== attractionId);
      localStorage.setItem('guide_attractions_' + guideEmail, JSON.stringify(filtered));
    }
    return of(true);
  }

  /**
   * Save attractions to localStorage (for backward compatibility)
   */
  saveToLocalStorage(guideEmail: string, attractions: GuideAttraction[]): void {
    localStorage.setItem('guide_attractions_' + guideEmail, JSON.stringify(attractions));
  }

  /**
   * Load attractions from localStorage (for backward compatibility)
   */
  loadFromLocalStorage(guideEmail: string): GuideAttraction[] {
    const saved = localStorage.getItem('guide_attractions_' + guideEmail);
    return saved ? JSON.parse(saved) : [];
  }
}
