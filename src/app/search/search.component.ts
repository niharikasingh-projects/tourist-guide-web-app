import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutosuggestService, LocationSuggestion } from '../services/autosuggest.service';
import { SearchService, TouristAttraction } from '../services/search.service';
import { SearchStateService } from '../services/search-state.service';
import { ResultCardComponent } from './result-card/result-card.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ResultCardComponent],
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  location = '';
  selectedDate: string | null = null;
  timeFrom = '';
  timeTo = '';
  minDate: string;

  // Validation error messages
  dateError = '';
  timeFromError = '';
  timeToError = '';
  locationError = '';

  // Search results
  searchResults: TouristAttraction[] = [];
  isSearching = false;
  hasSearched = false;

  // Autosuggest properties
  suggestions: LocationSuggestion[] = [];
  showSuggestions = false;
  selectedIndex = -1;
  private searchSubject = new Subject<string>();

  constructor(
    private autosuggestService: AutosuggestService,
    private searchService: SearchService,
    private searchStateService: SearchStateService,
    private cdr: ChangeDetectorRef
  ) {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    // Set up the autosuggest observable pipeline
    this.searchSubject.pipe(
      distinctUntilChanged(), // Only emit if value changed
      switchMap(query => this.autosuggestService.getSuggestions(query))
    ).subscribe(suggestions => {
      this.suggestions = suggestions;
      this.showSuggestions = suggestions.length > 0;
      this.selectedIndex = -1;
      this.isSearching = false;
      this.hasSearched = false;
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    // Restore search state if it exists
    const savedState = this.searchStateService.getSearchState();
    if (savedState) {
      this.location = savedState.location;
      this.selectedDate = savedState.selectedDate;
      this.timeFrom = savedState.timeFrom || '';
      this.timeTo = savedState.timeTo || '';
      this.searchResults = savedState.searchResults;
      this.hasSearched = savedState.hasSearched;
      this.cdr.detectChanges();
    }
  }

  onLocationInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.location = input;

    // Only trigger search if 2 or more characters
    if (input.length >= 2) {
      this.searchSubject.next(input);
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: LocationSuggestion) {
    this.location = suggestion.name;
    this.showSuggestions = false;
    this.suggestions = [];
    this.selectedIndex = -1;
  }

  onLocationKeydown(event: KeyboardEvent) {
    if (!this.showSuggestions || this.suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        if (this.selectedIndex >= 0 && this.selectedIndex < this.suggestions.length) {
          event.preventDefault();
          this.selectSuggestion(this.suggestions[this.selectedIndex]);
        }
        break;
      case 'Escape':
        this.showSuggestions = false;
        this.selectedIndex = -1;
        break;
    }
  }

  closeSuggestions() {
    // Delay to allow click event on suggestions to fire first
    setTimeout(() => {
      this.showSuggestions = false;
      this.selectedIndex = -1;
    }, 100);
  }

  onDateChange() {
    this.dateError = '';

    if (this.selectedDate) {
      const selected = new Date(this.selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        this.dateError = 'Date cannot be in the past';
        this.selectedDate = null;
        return;
      }
    }
  }

  onTimeChange() {
    this.timeFromError = '';
    this.timeToError = '';

    if (this.timeFrom && this.timeTo) {
      const [fromHour, fromMin] = this.timeFrom.split(':').map(Number);
      const [toHour, toMin] = this.timeTo.split(':').map(Number);

      const fromMinutes = fromHour * 60 + fromMin;
      const toMinutes = toHour * 60 + toMin;

      if (toMinutes <= fromMinutes) {
        this.timeToError = 'Time To must be after Time From';
        this.timeTo = '';
      }
    }
  }

  onSearch() {
    // Clear any existing errors and previous results
    this.dateError = '';
    this.timeFromError = '';
    this.timeToError = '';
    this.locationError = '';
    this.searchResults = [];

    // Validate location is not empty
    if (!this.location || this.location.trim() === '') {
      this.locationError = 'Please enter a location';
      return;
    }

    // Validate date
    if (this.selectedDate) {
      const selected = new Date(this.selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        this.dateError = 'Date cannot be in the past';
        return;
      }
    }

    // Validate times
    if (this.timeFrom && this.timeTo) {
      const [fromHour, fromMin] = this.timeFrom.split(':').map(Number);
      const [toHour, toMin] = this.timeTo.split(':').map(Number);

      const fromMinutes = fromHour * 60 + fromMin;
      const toMinutes = toHour * 60 + toMin;

      if (toMinutes <= fromMinutes) {
        this.timeToError = 'Time To must be after Time From';
        return;
      }
    }

    // Perform search
    this.isSearching = true;
    this.hasSearched = true;

    this.searchService.searchAttractionsByLocation(this.location).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.updateImageUrl(this.searchResults);
        this.isSearching = false;
        // Save search state
        this.searchStateService.saveSearchState({
          location: this.location,
          selectedDate: this.selectedDate,
          timeFrom: this.timeFrom,
          timeTo: this.timeTo,
          searchResults: this.searchResults,
          hasSearched: this.hasSearched
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isSearching = false;
        this.searchResults = [];
        this.cdr.detectChanges();
      }
    });
  }

  updateImageUrl(results: TouristAttraction[]): void {

    for (const result of results) {

      const imageUrl = result.imageUrl;
      if (!imageUrl) continue;

      // If it's a relative URL (starts with /), prepend the backend API URL
      if (imageUrl.startsWith('/')) {
        result.imageUrl = `${environment.apiUrl}/api${imageUrl}`;
      }

      // If it doesn't have a protocol (http:// or https://), treat as relative
      if (!imageUrl.match(/^https?:\/\//)) {
        continue;
      }

    }

  }

  onSelectAttraction(attractionId: string) {
    console.log('Selected attraction ID:', attractionId);
    // In a real app, this would navigate to the attraction detail page or save selection
    alert(`You selected attraction with ID: ${attractionId}`);
  }
}
