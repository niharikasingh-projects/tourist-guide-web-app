import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AdminAttraction {
  id: string;
  attractionName: string;
  location: string;
  city: string;
  country: string;
  description: string;
  category: string;
  pictures?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAdminAttractionDto {
  attractionName: string;
  location: string;
  city: string;
  country: string;
  description: string;
  category: string;
  pictures?: string[];
}

export interface UpdateAdminAttractionDto {
  attractionName?: string;
  location?: string;
  city?: string;
  country?: string;
  description?: string;
  category?: string;
  pictures?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminAttractionService {
  private apiUrl = `${environment.apiUrl}/api/attractions`;

  constructor(private http: HttpClient) {}

  /**
   * Get all attractions
   */
  getAllAttractions(): Observable<AdminAttraction[]> {
    return this.http.get<AdminAttraction[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Error fetching attractions:', error);
          return this.getLocalAttractions();
        })
      );
  }

  /**
   * Get attractions by location
   */
  getAttractionsByLocation(location: string): Observable<AdminAttraction[]> {
    return this.http.get<AdminAttraction[]>(`${this.apiUrl}/location/${encodeURIComponent(location)}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching attractions by location:', error);
          return this.getLocalAttractionsByLocation(location);
        })
      );
  }

  /**
   * Get attraction by ID
   */
  getAttractionById(id: string): Observable<AdminAttraction | null> {
    return this.http.get<AdminAttraction>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching attraction:', error);
          // Fallback to localStorage
          return this.getLocalAttractionById(id);
        })
      );
  }

  /**
   * Get attraction by ID from localStorage
   */
  private getLocalAttractionById(id: string): Observable<AdminAttraction | null> {
    try {
      const saved = localStorage.getItem('admin_attractions');
      if (saved) {
        const attractions: AdminAttraction[] = JSON.parse(saved);
        const attraction = attractions.find(a => a.id === id);
        return of(attraction || null);
      }
      return of(null);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return of(null);
    }
  }

  /**
   * Create a new attraction (admin only)
   */
  createAttraction(attraction: CreateAdminAttractionDto): Observable<AdminAttraction> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post<AdminAttraction>(this.apiUrl, attraction, { headers })
      .pipe(
        catchError(error => {
          console.error('Error creating attraction:', error);
          return this.createLocalAttraction(attraction);
        })
      );
  }

  /**
   * Update an existing attraction (admin only)
   */
  updateAttraction(id: string, attraction: UpdateAdminAttractionDto): Observable<AdminAttraction> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.put<AdminAttraction>(`${this.apiUrl}/${id}`, attraction, { headers })
      .pipe(
        catchError(error => {
          console.error('Error updating attraction:', error);
          return this.updateLocalAttraction(id, attraction);
        })
      );
  }

  /**
   * Delete an attraction (admin only)
   */
  deleteAttraction(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error deleting attraction:', error);
          return this.deleteLocalAttraction(id);
        })
      );
  }

  // ============== LOCAL STORAGE FALLBACK METHODS ==============

  private getLocalAttractions(): Observable<AdminAttraction[]> {
    const saved = localStorage.getItem('admin_attractions');
    const attractions = saved ? JSON.parse(saved) : [];
    return of(attractions);
  }

  private getLocalAttractionsByLocation(location: string): Observable<AdminAttraction[]> {
    const saved = localStorage.getItem('admin_attractions');
    const attractions: AdminAttraction[] = saved ? JSON.parse(saved) : [];
    const filtered = attractions.filter(a => 
      a.location.toLowerCase().includes(location.toLowerCase()) ||
      a.city.toLowerCase().includes(location.toLowerCase()) ||
      a.country.toLowerCase().includes(location.toLowerCase())
    );
    return of(filtered);
  }

  private createLocalAttraction(attraction: CreateAdminAttractionDto): Observable<AdminAttraction> {
    try {
      const saved = localStorage.getItem('admin_attractions');
      const attractions: AdminAttraction[] = saved ? JSON.parse(saved) : [];
      
      const newAttraction: AdminAttraction = {
        id: 'attr-' + Date.now().toString(),
        ...attraction,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      attractions.push(newAttraction);
      localStorage.setItem('admin_attractions', JSON.stringify(attractions));
      
      return of(newAttraction);
    } catch (error: any) {
      console.error('LocalStorage error:', error);
      if (error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please delete some attractions or reduce image sizes.');
      }
      throw error;
    }
  }

  private updateLocalAttraction(id: string, updates: UpdateAdminAttractionDto): Observable<AdminAttraction> {
    try {
      const saved = localStorage.getItem('admin_attractions');
      const attractions: AdminAttraction[] = saved ? JSON.parse(saved) : [];
      
      const index = attractions.findIndex(a => a.id === id);
      if (index !== -1) {
        attractions[index] = {
          ...attractions[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('admin_attractions', JSON.stringify(attractions));
        return of(attractions[index]);
      }
      
      return of({} as AdminAttraction);
    } catch (error: any) {
      console.error('LocalStorage error:', error);
      if (error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please delete some attractions or reduce image sizes.');
      }
      throw error;
    }
  }

  private deleteLocalAttraction(id: string): Observable<boolean> {
    try {
      const saved = localStorage.getItem('admin_attractions');
      if (saved) {
        const attractions: AdminAttraction[] = JSON.parse(saved);
        const filtered = attractions.filter(a => a.id !== id);
        localStorage.setItem('admin_attractions', JSON.stringify(filtered));
      }
      return of(true);
    } catch (error: any) {
      console.error('LocalStorage error:', error);
      return of(false);
    }
  }
}
