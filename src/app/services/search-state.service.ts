import { Injectable } from '@angular/core';
import { TouristAttraction } from './search.service';

export interface SearchState {
  location: string;
  fromDate: string | null;
  toDate: string | null;
  searchResults: TouristAttraction[];
  hasSearched: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  private searchState: SearchState | null = null;

  saveSearchState(state: SearchState): void {
    this.searchState = state;
  }

  getSearchState(): SearchState | null {
    return this.searchState;
  }

  clearSearchState(): void {
    this.searchState = null;
  }

  hasState(): boolean {
    return this.searchState !== null;
  }
}
