import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface LocationSuggestion {
  name: string;
  country: string;
  type: 'city' | 'attraction';
}

@Injectable({
  providedIn: 'root'
})
export class AutosuggestService {
  // Sample location data - in a real app, this would come from an API
  private locations: LocationSuggestion[] = [
    { name: 'Paris', country: 'France', type: 'city' },
    { name: 'Eiffel Tower', country: 'France', type: 'attraction' },
    { name: 'London', country: 'United Kingdom', type: 'city' },
    { name: 'Big Ben', country: 'United Kingdom', type: 'attraction' },
    { name: 'New York', country: 'United States', type: 'city' },
    { name: 'Statue of Liberty', country: 'United States', type: 'attraction' },
    { name: 'Rome', country: 'Italy', type: 'city' },
    { name: 'Colosseum', country: 'Italy', type: 'attraction' },
    { name: 'Tokyo', country: 'Japan', type: 'city' },
    { name: 'Mount Fuji', country: 'Japan', type: 'attraction' },
    { name: 'Barcelona', country: 'Spain', type: 'city' },
    { name: 'Sagrada Familia', country: 'Spain', type: 'attraction' },
    { name: 'Dubai', country: 'United Arab Emirates', type: 'city' },
    { name: 'Burj Khalifa', country: 'United Arab Emirates', type: 'attraction' },
    { name: 'Sydney', country: 'Australia', type: 'city' },
    { name: 'Sydney Opera House', country: 'Australia', type: 'attraction' },
    { name: 'Amsterdam', country: 'Netherlands', type: 'city' },
    { name: 'Anne Frank House', country: 'Netherlands', type: 'attraction' },
    { name: 'Berlin', country: 'Germany', type: 'city' },
    { name: 'Brandenburg Gate', country: 'Germany', type: 'attraction' },
    { name: 'Bangkok', country: 'Thailand', type: 'city' },
    { name: 'Grand Palace', country: 'Thailand', type: 'attraction' },
    { name: 'Istanbul', country: 'Turkey', type: 'city' },
    { name: 'Hagia Sophia', country: 'Turkey', type: 'attraction' },
    { name: 'Prague', country: 'Czech Republic', type: 'city' },
    { name: 'Prague Castle', country: 'Czech Republic', type: 'attraction' },
    { name: 'Venice', country: 'Italy', type: 'city' },
    { name: 'Grand Canal', country: 'Italy', type: 'attraction' },
    { name: 'Santorini', country: 'Greece', type: 'city' },
    { name: 'Acropolis', country: 'Greece', type: 'attraction' },
    { name: 'Bali', country: 'Indonesia', type: 'city' },
    { name: 'Tanah Lot Temple', country: 'Indonesia', type: 'attraction' },
    // Indian tourist destinations
    { name: 'Delhi', country: 'India', type: 'city' },
    { name: 'Taj Mahal', country: 'India', type: 'attraction' },
    { name: 'Agra', country: 'India', type: 'city' },
    { name: 'Jaipur', country: 'India', type: 'city' },
    { name: 'Amber Fort', country: 'India', type: 'attraction' },
    { name: 'Pune', country: 'India', type: 'city' },
    { name: 'Mumbai', country: 'India', type: 'city' },
    { name: 'Gateway of India', country: 'India', type: 'attraction' },
    { name: 'Goa', country: 'India', type: 'city' },
    { name: 'Baga Beach', country: 'India', type: 'attraction' },
    { name: 'Kerala', country: 'India', type: 'city' },
    { name: 'Backwaters', country: 'India', type: 'attraction' },
    { name: 'Udaipur', country: 'India', type: 'city' },
    { name: 'Lake Palace', country: 'India', type: 'attraction' },
    { name: 'Varanasi', country: 'India', type: 'city' },
    { name: 'Ganges River Ghats', country: 'India', type: 'attraction' },
    { name: 'Rishikesh', country: 'India', type: 'city' },
    { name: 'Laxman Jhula', country: 'India', type: 'attraction' },
    { name: 'Shimla', country: 'India', type: 'city' },
    { name: 'Mall Road', country: 'India', type: 'attraction' },
    { name: 'Manali', country: 'India', type: 'city' },
    { name: 'Rohtang Pass', country: 'India', type: 'attraction' },
    { name: 'Ladakh', country: 'India', type: 'city' },
    { name: 'Pangong Lake', country: 'India', type: 'attraction' },
    { name: 'Mysore', country: 'India', type: 'city' },
    { name: 'Mysore Palace', country: 'India', type: 'attraction' },
    { name: 'Bangalore', country: 'India', type: 'city' },
    { name: 'Lalbagh Botanical Garden', country: 'India', type: 'attraction' },
    { name: 'Hyderabad', country: 'India', type: 'city' },
    { name: 'Charminar', country: 'India', type: 'attraction' },
    { name: 'Kolkata', country: 'India', type: 'city' },
    { name: 'Victoria Memorial', country: 'India', type: 'attraction' },
    { name: 'Chennai', country: 'India', type: 'city' },
    { name: 'Marina Beach', country: 'India', type: 'attraction' },
    { name: 'Darjeeling', country: 'India', type: 'city' },
    { name: 'Tiger Hill', country: 'India', type: 'attraction' },
    { name: 'Amritsar', country: 'India', type: 'city' },
    { name: 'Golden Temple', country: 'India', type: 'attraction' },
    { name: 'Khajuraho', country: 'India', type: 'city' },
    { name: 'Khajuraho Temples', country: 'India', type: 'attraction' },
    { name: 'Hampi', country: 'India', type: 'city' },
    { name: 'Virupaksha Temple', country: 'India', type: 'attraction' },
    { name: 'Ranthambore', country: 'India', type: 'city' },
    { name: 'Ranthambore National Park', country: 'India', type: 'attraction' },
  ];

  constructor() {}

  /**
   * Get location suggestions based on user input
   * @param query The search query (minimum 2 characters)
   * @param maxResults Maximum number of results to return
   * @returns Observable of location suggestions
   */
  getSuggestions(query: string, maxResults: number = 5): Observable<LocationSuggestion[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    const filtered = this.locations
      .filter(location => 
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.country.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, maxResults);

    // Return immediately without artificial delay for faster response
    return of(filtered);
  }
}
