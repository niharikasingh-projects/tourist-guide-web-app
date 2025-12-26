import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService, TouristAttraction } from '../../services/search.service';
import { GuideService, Guide } from '../../services/guide.service';
import { GuideCardComponent } from '../guide-card/guide-card.component';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  imports: [CommonModule, GuideCardComponent, HeaderComponent, FooterComponent],
  selector: 'app-attraction-details',
  templateUrl: './attraction-details.component.html',
  styleUrls: ['./attraction-details.component.css']
})
export class AttractionDetailsComponent implements OnInit {
  attraction: TouristAttraction | null = null;
  guides: Guide[] = [];
  isLoading = true;
  error = '';
  selectedDate: string | null = null;
  timeFrom: string | null = null;
  timeTo: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private guideService: GuideService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const attractionId = this.route.snapshot.paramMap.get('id');
    this.selectedDate = this.route.snapshot.queryParamMap.get('date');
    this.timeFrom = this.route.snapshot.queryParamMap.get('timeFrom');
    this.timeTo = this.route.snapshot.queryParamMap.get('timeTo');
    
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
          this.updateImageUrl([attraction]);
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

  loadGuides(attractionId: string) {
    // Pass the selected date as both from and to since we're searching for a specific date
    const fromDate = this.selectedDate;
    const toDate = this.selectedDate;
    
    this.guideService.getGuidesByAttractionId(attractionId, fromDate, toDate, this.timeFrom, this.timeTo).subscribe({
      next: (guides) => {
        this.guides = guides;
        this.updateGuideImageUrl(this.guides);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // Don't set error - just show empty guides list
        // The attraction details should still be visible
        console.error('Error loading guides:', err);
        this.guides = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateGuideImageUrl(guides: Guide[]): void {
  
      for (const guide of guides) {
  
        const imageUrl = guide.profileImageUrl;
        if (!imageUrl) continue;
  
        // If it's a relative URL (starts with /), prepend the backend API URL
        if (imageUrl.startsWith('/')) {
          guide.profileImageUrl = `${environment.apiUrl}/api${imageUrl}`;
        }
  
        // If it doesn't have a protocol (http:// or https://), treat as relative
        if (!imageUrl.match(/^https?:\/\//)) {
          continue;
        }
  
      }
  
    }

  onBookGuide(guideId: string) {
    if (this.attraction) {
      const queryParams: any = {};
      const date = this.route.snapshot.queryParamMap.get('date');
      const timeFrom = this.route.snapshot.queryParamMap.get('timeFrom');
      const timeTo = this.route.snapshot.queryParamMap.get('timeTo');
      
      if (date) queryParams.date = date;
      if (timeFrom) queryParams.timeFrom = timeFrom;
      if (timeTo) queryParams.timeTo = timeTo;
      
      this.router.navigate(['/checkout', this.attraction.id, guideId], { queryParams });
    }
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
