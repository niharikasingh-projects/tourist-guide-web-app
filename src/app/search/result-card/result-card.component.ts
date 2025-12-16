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
  @Input() selectedDate: string | null = null;
  @Input() timeFrom: string = '';
  @Input() timeTo: string = '';
  @Output() selectAttraction = new EventEmitter<string>();

  constructor(private router: Router) {}

  onSelect() {
    const queryParams: any = {};
    if (this.selectedDate) queryParams.date = this.selectedDate;
    if (this.timeFrom) queryParams.timeFrom = this.timeFrom;
    if (this.timeTo) queryParams.timeTo = this.timeTo;
    this.router.navigate(['/attraction', this.attraction.id], { queryParams });
  }

  getRatingStars(): string {
    const fullStars = Math.floor(this.attraction.rating);
    const hasHalfStar = this.attraction.rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }
}
