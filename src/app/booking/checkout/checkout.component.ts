import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService, TouristAttraction } from '../../services/search.service';
import { GuideService, Guide } from '../../services/guide.service';
import { BookingService } from '../../services/booking.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  attraction: TouristAttraction | null = null;
  guide: Guide | null = null;
  isLoading = true;
  error = '';
  isProcessing = false;

  // Form fields
  customerName = '';
  customerContact = '';
  customerEmail = '';
  hoursBooked = 1;
  selectedDate = new Date();
  timeFrom = '';
  timeTo = '';

  // Validation flags
  formSubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private guideService: GuideService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const attractionId = this.route.snapshot.paramMap.get('attractionId');
    const guideId = this.route.snapshot.paramMap.get('guideId');

    // Get date and time from query params
    const dateParam = this.route.snapshot.queryParamMap.get('date');
    const timeFromParam = this.route.snapshot.queryParamMap.get('timeFrom');
    const timeToParam = this.route.snapshot.queryParamMap.get('timeTo');

    if (dateParam) {
      this.selectedDate = new Date(dateParam);
    }

    if (timeFromParam && timeToParam) {
      this.timeFrom = timeFromParam;
      this.timeTo = timeToParam;

      // Calculate hours based on time difference
      const [fromHour, fromMin] = timeFromParam.split(':').map(Number);
      const [toHour, toMin] = timeToParam.split(':').map(Number);
      const fromMinutes = fromHour * 60 + fromMin;
      const toMinutes = toHour * 60 + toMin;
      this.hoursBooked = (toMinutes - fromMinutes) / 60;
    }

    // Restore customer details from navigation state (when coming back from payment page)
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    if (state) {
      if (state['customerName']) this.customerName = state['customerName'];
      if (state['customerContact']) this.customerContact = state['customerContact'];
      if (state['customerEmail']) this.customerEmail = state['customerEmail'];
    }

    if (attractionId && guideId) {
      this.loadCheckoutData(attractionId, guideId);
    } else {
      this.error = 'Invalid checkout parameters';
      this.isLoading = false;
    }
  }

  loadCheckoutData(attractionId: string, guideId: string) {
    this.isLoading = true;

    // Load attraction details
    this.searchService.getAttractionById(attractionId).subscribe({
      next: (attraction) => {
        if (attraction) {
          this.attraction = attraction;
          this.attraction.imageUrl = this.getUpdatedAttractionPictureUrl(attraction);
          this.loadGuide(attractionId, guideId);
        } else {
          this.error = 'Attraction not found';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.error = 'Failed to load attraction details';
        this.isLoading = false;
      }
    });
  }

  loadGuide(attractionId: string, guideId: string) {
    this.guideService.getGuidesByAttractionId(attractionId).subscribe({
      next: (guides) => {
        this.guide = guides.find(g => g.id.toString() === guideId) || null;
        this.guide!.profileImageUrl = this.getUpdatedGuidePictureUrl(this.guide!);
        if (!this.guide) {
          this.error = 'Guide not found';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load guide details';
        this.isLoading = false;
      }
    });
  }

  get totalAmount(): number {
    if (!this.guide) return 0;
    // Base calculation: guide hourly rate
    return this.guide.hourlyRate;
  }

  getUpdatedAttractionPictureUrl(attraction: TouristAttraction): string {
    // If it's a relative URL (starts with /), prepend the backend API URL
    if (attraction.imageUrl.startsWith('/')) {
      return `${environment.apiUrl}/api${attraction.imageUrl}`;
    }

    // If it doesn't have a protocol (http:// or https://), treat as relative
    if (!attraction.imageUrl.match(/^https?:\/\//)) {
      return `${environment.apiUrl}/api${attraction.imageUrl}`;
    }

    // Otherwise return as is (full URL or base64)
    return attraction.imageUrl;
  }

    getUpdatedGuidePictureUrl(guide: Guide): string {
    // If it's a relative URL (starts with /), prepend the backend API URL
    if (guide.profileImageUrl.startsWith('/')) {
      return `${environment.apiUrl}/api${guide.profileImageUrl}`;
    }

    // If it doesn't have a protocol (http:// or https://), treat as relative
    if (!guide.profileImageUrl.match(/^https?:\/\//)) {
      return `${environment.apiUrl}/api${guide.profileImageUrl}`;
    }

    // Otherwise return as is (full URL or base64)
    return guide.profileImageUrl;
  }

  isFormValid(): boolean {
    return !!(
      this.customerName.trim() &&
      this.customerContact.trim() &&
      this.customerEmail.trim() &&
      this.isValidEmail(this.customerEmail) &&
      this.isValidPhone(this.customerContact)
    );
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9]{10,10}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  onConfirmBooking() {
    this.formSubmitted = true;

    if (!this.isFormValid()) {
      return;
    }

    if (!this.attraction || !this.guide) {
      this.error = 'Missing booking information';
      return;
    }

    // Navigate to payment page with booking data
    this.router.navigate(['/payment'], {
      state: {
        attraction: this.attraction,
        guide: this.guide,
        selectedDate: this.selectedDate,
        timeFrom: this.timeFrom,
        timeTo: this.timeTo,
        customerName: this.customerName.trim(),
        customerContact: this.customerContact.trim(),
        customerEmail: this.customerEmail.trim(),
        hoursBooked: this.hoursBooked
      }
    });
  }

  goBack() {
    this.router.navigate(['/attraction', this.attraction?.id]);
  }
}
