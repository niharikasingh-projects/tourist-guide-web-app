import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  @Output() selectAttraction = new EventEmitter<string>();

  onSelect() {
    this.selectAttraction.emit(this.attraction.id);
  }

  getRatingStars(): string {
    const fullStars = Math.floor(this.attraction.rating);
    const hasHalfStar = this.attraction.rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }
}
