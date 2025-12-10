import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService, TouristAttraction } from '../../services/search.service';
import { GuideService, Guide } from '../../services/guide.service';
import { BookingService } from '../../services/booking.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

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

  // Validation flags
  formSubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private guideService: GuideService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const attractionId = this.route.snapshot.paramMap.get('attractionId');
    const guideId = this.route.snapshot.paramMap.get('guideId');

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
        this.guide = guides.find(g => g.id === guideId) || null;
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
    const phoneRegex = /^[0-9]{10,15}$/;
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

    this.isProcessing = true;
    this.error = '';

    const bookingData = {
      attractionId: this.attraction.id,
      attractionName: this.attraction.name,
      guideId: this.guide.id,
      guideName: this.guide.name,
      guideContact: this.guide.phoneNumber || 'N/A',
      guideEmail: this.guide.email || 'N/A',
      customerName: this.customerName.trim(),
      customerContact: this.customerContact.trim(),
      customerEmail: this.customerEmail.trim(),
      amount: this.totalAmount
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: (booking) => {
        this.isProcessing = false;
        this.router.navigate(['/booking-confirmation', booking.id]);
      },
      error: (err) => {
        this.error = 'Failed to process booking. Please try again.';
        this.isProcessing = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.router.navigate(['/attraction', this.attraction?.id]);
  }
}
