import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService, Booking } from '../../services/booking.service';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = true;
  error = '';
  showCancelModal = false;
  isCancelling = false;
  cancelError = '';
  selectedBooking: Booking | null = null;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'Please sign in to view your bookings';
      this.isLoading = false;
      return;
    }

    this.loadBookings(currentUser.email);
  }

  loadBookings(email: string) {
    this.isLoading = true;
    this.bookingService.getBookingsByCustomerEmail(email).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Failed to load bookings';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCancelModal(booking: Booking) {
    this.selectedBooking = booking;
    this.showCancelModal = true;
    this.cancelError = '';
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.selectedBooking = null;
    this.cancelError = '';
  }

  confirmCancellation() {
    if (!this.selectedBooking) return;

    this.isCancelling = true;
    this.cancelError = '';

    this.bookingService.cancelBooking(this.selectedBooking.id).subscribe({
      next: (success) => {
        if (success && this.selectedBooking) {
          // Update the booking in the list
          const index = this.bookings.findIndex(b => b.id === this.selectedBooking!.id);
          if (index !== -1) {
            this.bookings[index].status = 'cancelled';
          }
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

  viewBookingDetails(bookingId: string) {
    this.router.navigate(['/booking-confirmation', bookingId]);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    return status === 'confirmed' ? 'status-confirmed' : 'status-cancelled';
  }

  getStatusIcon(status: string): string {
    return status === 'confirmed' ? '✓' : '✕';
  }
}
