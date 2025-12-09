import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
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
