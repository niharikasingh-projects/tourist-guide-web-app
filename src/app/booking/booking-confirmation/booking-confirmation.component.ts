import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService, Booking } from '../../services/booking.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  selector: 'app-booking-confirmation',
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.css']
})
export class BookingConfirmationComponent implements OnInit {
  booking: Booking | null = null;
  isLoading = true;
  error = '';
  showCancelModal = false;
  isCancelling = false;
  cancelError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const bookingId = this.route.snapshot.paramMap.get('bookingId');
    if (bookingId) {
      this.loadBooking(bookingId);
    } else {
      this.error = 'Invalid booking ID';
      this.isLoading = false;
    }
  }

  loadBooking(bookingId: string) {
    this.isLoading = true;
    this.bookingService.getBookingById(bookingId).subscribe({
      next: (booking) => {
        if (booking) {
          this.booking = booking;
        } else {
          this.error = 'Booking not found';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load booking details';
        this.isLoading = false;
      }
    });
  }

  openCancelModal() {
    this.showCancelModal = true;
    this.cancelError = '';
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.cancelError = '';
  }

  confirmCancellation() {
    if (!this.booking) return;

    this.isCancelling = true;
    this.cancelError = '';

    this.bookingService.cancelBooking(this.booking.id).subscribe({
      next: (success) => {
        if (success && this.booking) {
          this.booking.status = 'cancelled';
          this.isCancelling = false;
          this.closeCancelModal();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.cancelError = 'Failed to cancel booking. Please try again.';
        this.isCancelling = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
