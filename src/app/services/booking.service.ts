import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';

export interface Booking {
  id: string;
  attractionId: string;
  attractionName: string;
  guideId: string;
  guideName: string;
  guideContact: string;
  guideEmail: string;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  amount: number;
  bookingDate: string;
  status: 'confirmed' | 'cancelled';
  fromDate?: string;
  toDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookings: Map<string, Booking> = new Map();
  private bookingCounter = 1000;
  private readonly STORAGE_KEY = 'tourist_guide_bookings';
  private readonly COUNTER_KEY = 'tourist_guide_booking_counter';

  constructor() {
    this.loadBookingsFromStorage();
  }

  private loadBookingsFromStorage(): void {
    try {
      const storedBookings = localStorage.getItem(this.STORAGE_KEY);
      const storedCounter = localStorage.getItem(this.COUNTER_KEY);
      
      if (storedBookings) {
        const bookingsArray: Booking[] = JSON.parse(storedBookings);
        bookingsArray.forEach(booking => {
          this.bookings.set(booking.id, booking);
        });
      }
      
      if (storedCounter) {
        this.bookingCounter = parseInt(storedCounter, 10);
      }
    } catch (error) {
      console.error('Error loading bookings from storage:', error);
    }
  }

  private saveBookingsToStorage(): void {
    try {
      const bookingsArray = Array.from(this.bookings.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookingsArray));
      localStorage.setItem(this.COUNTER_KEY, this.bookingCounter.toString());
    } catch (error) {
      console.error('Error saving bookings to storage:', error);
    }
  }

  generateBookingId(): string {
    this.bookingCounter++;
    this.saveBookingsToStorage();
    return `BK${this.bookingCounter}`;
  }

  createBooking(booking: Omit<Booking, 'id' | 'bookingDate' | 'status'>): Observable<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: this.generateBookingId(),
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };

    this.bookings.set(newBooking.id, newBooking);
    this.saveBookingsToStorage();
    
    // Simulate API call with delay
    return of(newBooking).pipe(delay(500));
  }

  getBookingById(id: string): Observable<Booking | null> {
    const booking = this.bookings.get(id);
    return of(booking || null).pipe(delay(300));
  }

  getBookingsByCustomerEmail(email: string): Observable<Booking[]> {
    const userBookings = Array.from(this.bookings.values())
      .filter(booking => booking.customerEmail === email)
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    return of(userBookings).pipe(delay(300));
  }

  cancelBooking(id: string): Observable<boolean> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = 'cancelled';
      this.bookings.set(id, booking);
      this.saveBookingsToStorage();
      return of(true).pipe(delay(400));
    }
    return throwError(() => new Error('Booking not found'));
  }

  getAllBookings(): Observable<Booking[]> {
    return of(Array.from(this.bookings.values())).pipe(delay(300));
  }
}
