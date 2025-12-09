import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutosuggestService, LocationSuggestion } from '../services/autosuggest.service';
import { SearchService, TouristAttraction } from '../services/search.service';
import { ResultCardComponent } from './result-card/result-card.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ResultCardComponent],
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  location = '';
  fromDate: string | null = null;
  toDate: string | null = null;
  minDate: string;
  
  // Date validation error messages
  fromDateError = '';
  toDateError = '';
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

  onFromDateChange() {
    this.fromDateError = '';
    
    if (this.fromDate) {
      const selectedDate = new Date(this.fromDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        this.fromDateError = 'From date cannot be in the past';
        this.fromDate = null;
        return;
      }
      
      // Validate against to date if it exists
      if (this.toDate) {
        this.validateToDate();
      }
    }
  }

  onToDateChange() {
    this.validateToDate();
  }

  private validateToDate() {
    this.toDateError = '';
    
    if (this.toDate && this.fromDate) {
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);
      
      if (to < from) {
        this.toDateError = 'To date cannot be earlier than from date';
        this.toDate = null;
      }
    }
  }

  onSearch() {
    // Clear any existing errors and previous results
    this.fromDateError = '';
    this.toDateError = '';
    this.locationError = '';
    this.searchResults = [];
    
    // Validate location is not empty
    if (!this.location || this.location.trim() === '') {
      this.locationError = 'Please enter a location';
      return;
    }
    
    // Validate dates before search
    if (this.fromDate) {
      const selectedDate = new Date(this.fromDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        this.fromDateError = 'From date cannot be in the past';
        return;
      }
    }
    
    if (this.toDate && this.fromDate) {
      const from = new Date(this.fromDate);
      const to = new Date(this.toDate);
      
      if (to < from) {
        this.toDateError = 'To date cannot be earlier than from date';
        return;
      }
    }
    
    // Perform search
    this.isSearching = true;
    this.hasSearched = true;
    
    this.searchService.searchAttractionsByLocation(this.location).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
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

  onSelectAttraction(attractionId: string) {
    console.log('Selected attraction ID:', attractionId);
    // In a real app, this would navigate to the attraction detail page or save selection
    alert(`You selected attraction with ID: ${attractionId}`);
  }
}
