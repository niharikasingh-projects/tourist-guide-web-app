import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-search',
  template: `
    <form (ngSubmit)="onSearch()" class="search-form" role="search" aria-label="Find a guide">
      <label>
        <span class="sr-only">Location</span>
        <input name="location" [(ngModel)]="location" placeholder="Location (city or attraction)" aria-label="Location" />
      </label>
      <label>
        <span class="sr-only">From Date</span>
        <input type="date" name="from" [(ngModel)]="fromDate" aria-label="From date" />
      </label>
      <label>
        <span class="sr-only">To Date</span>
        <input type="date" name="to" [(ngModel)]="toDate" aria-label="To date" />
      </label>
      <button type="submit" class="search-button" aria-label="Search for guides">Search</button>
    </form>
  `,
  styles: [
    `
      .search-form { display:flex; gap:0.5rem; align-items:flex-end; flex-wrap:wrap }
      .search-form label { display:flex; flex-direction:column; font-size:0.95rem; flex:1 1 180px; min-width:150px }
      .search-form input { padding:0.5rem 0.6rem; width:100%; box-sizing:border-box; font-size:0.95rem }
      .search-form .search-button { padding:0.6rem 0.9rem; font-size:1rem; border-radius:6px; cursor:pointer }

      .sr-only { position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden }

      /* On small screens make inputs stack full width and button full width */
      @media (max-width: 600px) {
        .search-form { flex-direction:column; align-items:stretch }
        .search-form label { min-width:0 }
        .search-form .search-button { width:100%; margin-top:0.5rem }
      }
    `
  ]
})
export class SearchComponent {
  location = '';
  fromDate: string | null = null;
  toDate: string | null = null;

  onSearch() {
    // simple demo action — in a real app you'd call a service
    alert(`Searching for guides in ${this.location} from ${this.fromDate || '—'} to ${this.toDate || '—'}`);
  }
}
