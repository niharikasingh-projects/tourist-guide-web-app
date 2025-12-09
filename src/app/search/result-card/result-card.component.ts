import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TouristAttraction } from '../../services/search.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-result-card',
  templateUrl: './result-card.component.html',
  styleUrls: ['./result-card.component.css']
})
export class ResultCardComponent {
  @Input() attraction!: TouristAttraction;
  @Input() fromDate: string | null = null;
  @Input() toDate: string | null = null;
  @Output() selectAttraction = new EventEmitter<string>();

  constructor(private router: Router) {}

  onSelect() {
    const queryParams: any = {};
    if (this.fromDate) queryParams.from = this.fromDate;
    if (this.toDate) queryParams.to = this.toDate;
    this.router.navigate(['/attraction', this.attraction.id], { queryParams });
  }

  getRatingStars(): string {
    const fullStars = Math.floor(this.attraction.rating);
    const hasHalfStar = this.attraction.rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }
}
