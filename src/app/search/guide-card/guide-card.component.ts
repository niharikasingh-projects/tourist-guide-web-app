import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Guide } from '../../services/guide.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-guide-card',
  templateUrl: './guide-card.component.html',
  styleUrls: ['./guide-card.component.css']
})
export class GuideCardComponent {
  @Input() guide!: Guide;
  @Output() bookGuide = new EventEmitter<string>();

  onBook() {
    this.bookGuide.emit(this.guide.id);
  }

  getRatingStars(): string {
    const fullStars = Math.floor(this.guide.rating);
    const hasHalfStar = this.guide.rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }
}
