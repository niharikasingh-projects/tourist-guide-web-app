import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { BookingService, Booking } from '../../services/booking.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  selector: 'app-guide-bookings',
  templateUrl: './guide-bookings.component.html',
  styleUrls: ['./guide-bookings.component.css']
})
export class GuideBookingsComponent implements OnInit {
  allBookings: Booking[] = [];
  currentBookings: Booking[] = [];
  pastBookings: Booking[] = [];
  futureBookings: Booking[] = [];
  activeTab: 'current' | 'past' | 'future' = 'current';
  isLoading = true;

  constructor(
    private auth: AuthService,
    private router: Router,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user || user.role !== 'guide') {
      this.router.navigate(['/']);
      return;
    }

    this.loadBookings();
  }

  loadBookings() {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.isLoading = true;

    // Use BookingService to fetch bookings
    this.bookingService.getBookingsByGuideId(user?.id ?? '').subscribe({
      next: (bookings) => {
        this.allBookings = bookings;

        // Categorize bookings by date
        const categorized = this.bookingService.categorizeBookingsByDate(bookings);
        this.currentBookings = categorized.current;
        this.pastBookings = categorized.past;
        this.futureBookings = categorized.future;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.isLoading = false;
      }
    });
  }

  get displayedBookings(): Booking[] {
    switch (this.activeTab) {
      case 'current': return this.currentBookings;
      case 'past': return this.pastBookings;
      case 'future': return this.futureBookings;
      default: return [];
    }
  }

  setActiveTab(tab: 'current' | 'past' | 'future') {
    this.activeTab = tab;
  }

  confirmBooking(id: string) {
    this.bookingService.updateBookingStatus(id, 'confirmed').subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error confirming booking:', error);
      }
    });
  }

  cancelBooking(id: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(id).subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (error) => {
          console.error('Error cancelling booking:', error);
        }
      });
    }
  }

  completeBooking(id: string) {
    this.bookingService.updateBookingStatus(id, 'completed').subscribe({
      next: () => {
        this.loadBookings();
      },
      error: (error) => {
        console.error('Error completing booking:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getPaymentStatusClass(paymentStatus?: string): string {
    if (!paymentStatus) return '';
    const classes: { [key: string]: string } = {
      'completed': 'payment-completed',
      'pending': 'payment-pending',
      'refunded': 'payment-refunded'
    };
    return classes[paymentStatus] || '';
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'upi': 'UPI',
      'credit-card': 'Credit/Debit Card',
      'pay-later': 'Pay at Check-in'
    };
    return labels[method] || method;
  }

  getHoursBooked(timeFrom?: string, timeTo?: string): number {
    if (!timeFrom || !timeTo) return 0;
    const [fromHour, fromMin] = timeFrom.split(':').map(Number);
    const [toHour, toMin] = timeTo.split(':').map(Number);
    const fromMinutes = fromHour * 60 + fromMin;
    const toMinutes = toHour * 60 + toMin;
    return (toMinutes - fromMinutes) / 60;
  }
}
