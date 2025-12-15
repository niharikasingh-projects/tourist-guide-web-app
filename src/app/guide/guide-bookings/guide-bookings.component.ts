import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  attraction: string;
  location: string;
  date: string;
  hours: number;
  amount: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  selector: 'app-guide-bookings',
  templateUrl: './guide-bookings.component.html',
  styleUrls: ['./guide-bookings.component.css']
})
export class GuideBookingsComponent implements OnInit {
  allBookings: Booking[] = [];
  activeTab: 'current' | 'past' | 'future' = 'current';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

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

    // Load from localStorage (mock data for demonstration)
    const saved = localStorage.getItem('guide_bookings_' + user.email);
    if (saved) {
      this.allBookings = JSON.parse(saved);
    } else {
      // Sample bookings for demonstration
      this.allBookings = [
        {
          id: 'BK-1001',
          customerName: 'Raj Kumar',
          customerEmail: 'raj@example.com',
          attraction: 'Taj Mahal',
          location: 'Agra, Uttar Pradesh',
          date: this.getDateString(2),
          hours: 4,
          amount: 1400,
          status: 'confirmed',
          createdAt: this.getDateString(-5)
        },
        {
          id: 'BK-1002',
          customerName: 'Priya Sharma',
          customerEmail: 'priya@example.com',
          attraction: 'Red Fort',
          location: 'Delhi',
          date: this.getDateString(-10),
          hours: 3,
          amount: 1050,
          status: 'completed',
          createdAt: this.getDateString(-15)
        },
        {
          id: 'BK-1003',
          customerName: 'Amit Patel',
          customerEmail: 'amit@example.com',
          attraction: 'Qutub Minar',
          location: 'Delhi',
          date: this.getDateString(7),
          hours: 2,
          amount: 700,
          status: 'pending',
          createdAt: this.getDateString(-1)
        }
      ];
      this.saveBookings();
    }
  }

  get currentBookings(): Booking[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allBookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate.getTime() === today.getTime() && b.status !== 'cancelled' && b.status !== 'completed';
    });
  }

  get pastBookings(): Booking[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allBookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate < today || b.status === 'completed';
    });
  }

  get futureBookings(): Booking[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allBookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate > today && b.status !== 'cancelled' && b.status !== 'completed';
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
    const booking = this.allBookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'confirmed';
      this.saveBookings();
    }
  }

  cancelBooking(id: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      const booking = this.allBookings.find(b => b.id === id);
      if (booking) {
        booking.status = 'cancelled';
        this.saveBookings();
      }
    }
  }

  completeBooking(id: string) {
    const booking = this.allBookings.find(b => b.id === id);
    if (booking) {
      booking.status = 'completed';
      this.saveBookings();
    }
  }

  private saveBookings() {
    const user = this.auth.getCurrentUser();
    if (user) {
      localStorage.setItem('guide_bookings_' + user.email, JSON.stringify(this.allBookings));
    }
  }

  private getDateString(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }
}
