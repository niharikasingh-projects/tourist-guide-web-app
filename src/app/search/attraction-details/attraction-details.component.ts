import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService, TouristAttraction } from '../../services/search.service';
import { GuideService, Guide } from '../../services/guide.service';
import { GuideCardComponent } from '../guide-card/guide-card.component';

@Component({
  standalone: true,
  imports: [CommonModule, GuideCardComponent],
  selector: 'app-attraction-details',
  templateUrl: './attraction-details.component.html',
  styleUrls: ['./attraction-details.component.css']
})
export class AttractionDetailsComponent implements OnInit {
  attraction: TouristAttraction | null = null;
  guides: Guide[] = [];
  isLoading = true;
  error = '';
  fromDate: string | null = null;
  toDate: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private guideService: GuideService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const attractionId = this.route.snapshot.paramMap.get('id');
    this.fromDate = this.route.snapshot.queryParamMap.get('from');
    this.toDate = this.route.snapshot.queryParamMap.get('to');
    
    if (attractionId) {
      this.loadAttractionDetails(attractionId);
    } else {
      this.error = 'Invalid attraction ID';
      this.isLoading = false;
    }
  }

  loadAttractionDetails(attractionId: string) {
    this.isLoading = true;
    this.searchService.getAttractionById(attractionId).subscribe({
      next: (attraction) => {
        if (attraction) {
          this.attraction = attraction;
          this.loadGuides(attractionId);
          this.cdr.detectChanges();
        } else {
          this.error = 'Attraction not found';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.error = 'Failed to load attraction details';
        this.isLoading = false;
        console.error('Error loading attraction:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadGuides(attractionId: string) {
    this.guideService.getGuidesByAttractionId(attractionId, this.fromDate, this.toDate).subscribe({
      next: (guides) => {
        this.guides = guides;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load guides';
        this.isLoading = false;
        console.error('Error loading guides:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onBookGuide(guideId: string) {
    console.log('Booking guide:', guideId);
    // TODO: Navigate to booking page or show booking modal
    alert(`Booking guide ${guideId}. This will be implemented in the booking feature.`);
  }

  goBack() {
    // Navigate back to home which contains the search component
    // The search state will be automatically restored
    this.router.navigate(['/home']);
  }

  getRatingStars(): string {
    if (!this.attraction) return '';
    const fullStars = Math.floor(this.attraction.rating);
    const hasHalfStar = this.attraction.rating % 1 >= 0.5;
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  }
}
