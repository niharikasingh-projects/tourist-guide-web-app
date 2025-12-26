import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, delay, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  selectedDate?: Date | null;
  timeFrom?: string;
  timeTo?: string;
  hoursBooked?: number;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  totalTax?: number;
  amount: number;
  paymentMethod?: 'upi' | 'credit-card' | 'pay-later';
  paymentStatus?: 'paid' | 'pending' | 'refunded';
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
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
  private apiUrl = `${environment.apiUrl}/api/bookings`;

  constructor(private http: HttpClient) {
    // this.loadBookingsFromStorage();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
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
    return this.http.post<Booking>(`${this.apiUrl}`, booking, { headers: this.getAuthHeaders() })
      .pipe(
        map(newBooking => {
          this.bookings.set(newBooking.id, newBooking);
          // this.saveBookingsToStorage();
          // this.saveToGuideBookings(newBooking);
          return newBooking;
        }),
        catchError(error => {
          console.error('Error creating booking:', error);
          throw new Error('Booking Creation Failed');
          // return this.createLocalBooking(booking);
        })
      );
  }

  private createLocalBooking(booking: Omit<Booking, 'id' | 'bookingDate' | 'status'>): Observable<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: this.generateBookingId(),
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };

    this.bookings.set(newBooking.id, newBooking);
    this.saveBookingsToStorage();
    this.saveToGuideBookings(newBooking);
    
    return of(newBooking).pipe(delay(500));
  }

  getBookingById(id: string): Observable<Booking | null> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching booking:', error);
          throw new Error('Booking Fetch Failed');
          // const booking = this.bookings.get(id);
          // return of(booking || null);
        })
      );
  }

  getBookingsByCustomerId(id: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my-bookings/${encodeURIComponent(id)}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(bookings => bookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())),
        catchError(error => {
          console.error('Error fetching customer bookings:', error);
          throw new Error('Customer Bookings Fetch Failed');
          // const userBookings = Array.from(this.bookings.values())
          //   .filter(booking => booking.customerEmail === email)
          //   .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
          // return of(userBookings);
        })
      );
  }

  getBookingsByCustomerEmail(email: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my-bookings/${encodeURIComponent(email)}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(bookings => bookings.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())),
        catchError(error => {
          console.error('Error fetching customer bookings:', error);
          throw new Error('Customer Bookings Fetch Failed');
          // const userBookings = Array.from(this.bookings.values())
          //   .filter(booking => booking.customerEmail === email)
          //   .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
          // return of(userBookings);
        })
      );
  }

  cancelBooking(id: string): Observable<boolean> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.getAuthHeaders() })
      .pipe(
        map(booking => {
          this.bookings.set(id, booking);
          // this.saveBookingsToStorage();
          // this.updateGuideBooking(booking);
          return true;
        }),
        catchError(error => {
          console.error('Error cancelling booking:', error);
          // const booking = this.bookings.get(id);
          // if (booking) {
          //   booking.status = 'cancelled';
          //   if (booking.paymentStatus === 'paid') {
          //     booking.paymentStatus = 'refunded';
          //   }
          //   this.bookings.set(id, booking);
          //   this.saveBookingsToStorage();
          //   this.updateGuideBooking(booking);
          //   return of(true);
          // }
          // return throwError(() => new Error('Booking not found'));
          throw new Error('Booking Cancellation Failed');
        })
      );
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching all bookings:', error);
          throw new Error('All Bookings Fetch Failed');
          // return of(Array.from(this.bookings.values()));
        })
      );
  }

  /**
   * Save booking to guide-specific localStorage (guide_bookings_<guideEmail>)
   */
  private saveToGuideBookings(booking: Booking): void {
    try {
      const guideEmail = booking.guideEmail;
      const storageKey = `guide_bookings_${guideEmail}`;
      
      const existingBookingsJson = localStorage.getItem(storageKey);
      const existingBookings: Booking[] = existingBookingsJson ? JSON.parse(existingBookingsJson) : [];
      
      existingBookings.push(booking);
      localStorage.setItem(storageKey, JSON.stringify(existingBookings));
    } catch (error) {
      console.error('Error saving to guide bookings:', error);
    }
  }

  /**
   * Update booking in guide-specific localStorage
   */
  private updateGuideBooking(booking: Booking): void {
    try {
      const guideEmail = booking.guideEmail;
      const storageKey = `guide_bookings_${guideEmail}`;
      
      const existingBookingsJson = localStorage.getItem(storageKey);
      if (existingBookingsJson) {
        const existingBookings: Booking[] = JSON.parse(existingBookingsJson);
        const index = existingBookings.findIndex(b => b.id === booking.id);
        
        if (index !== -1) {
          existingBookings[index] = booking;
          localStorage.setItem(storageKey, JSON.stringify(existingBookings));
        }
      }
    } catch (error) {
      console.error('Error updating guide booking:', error);
    }
  }

  /**
   * Get bookings for a specific guide by guideId and optional date
   * This method tries backend API first, then falls back to localStorage
   */
  getBookingsForGuide(guideId: string, selectedDate?: string): Observable<Booking[]> {
    const url = `${this.apiUrl}/guide/${guideId}${selectedDate ? '?date=' + selectedDate : ''}`;
    return this.http.get<Booking[]>(url, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching guide bookings:', error);
          throw new Error('Guide Bookings Fetch Failed');
          // return this.getLocalBookingsForGuide(guideId, selectedDate);
        })
      );
  }

  /**
   * Get bookings from localStorage for a specific guide
   */
  private getLocalBookingsForGuide(guideId: string, selectedDate?: string): Observable<Booking[]> {
    try {
      const bookingsJson = localStorage.getItem(this.STORAGE_KEY);
      if (!bookingsJson) {
        return of([]);
      }

      const allBookings: Booking[] = JSON.parse(bookingsJson);
      
      // Filter bookings for this guide
      let guideBookings = allBookings.filter(booking => {
        if (booking.guideId !== guideId || booking.status === 'cancelled') {
          return false;
        }
        
        // If selectedDate is provided, filter by date
        if (selectedDate && booking.selectedDate) {
          const bookingDate = new Date(booking.selectedDate).toISOString().split('T')[0];
          return bookingDate === selectedDate;
        }
        
        return true;
      });
      
      return of(guideBookings);
    } catch (error) {
      console.error('Error reading bookings from localStorage:', error);
      return of([]);
    }
  }

  /**
   * Get all bookings for a guide by email
   */
  getBookingsByGuideEmail(guideEmail: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/guide-email/${encodeURIComponent(guideEmail)}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(error => {
          console.error('Error fetching bookings by guide email:', error);
          throw new Error('Guide Email Bookings Fetch Failed');
          // return this.getLocalBookingsByGuideEmail(guideEmail);
        })
      );
  }

  /**
   * Get bookings from localStorage by guide email
   */
  private getLocalBookingsByGuideEmail(guideEmail: string): Observable<Booking[]> {
    try {
      const bookingsJson = localStorage.getItem(this.STORAGE_KEY);
      if (!bookingsJson) {
        return of([]);
      }

      const allBookings: Booking[] = JSON.parse(bookingsJson);
      const guideBookings = allBookings.filter(booking => booking.guideEmail === guideEmail);
      
      return of(guideBookings);
    } catch (error) {
      console.error('Error reading bookings from localStorage:', error);
      return of([]);
    }
  }

  /**
   * Categorize bookings into current, past, and future based on selected date
   */
  categorizeBookingsByDate(bookings: Booking[]): {
    current: Booking[];
    past: Booking[];
    future: Booking[];
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const current: Booking[] = [];
    const past: Booking[] = [];
    const future: Booking[] = [];

    bookings.forEach(booking => {
      if (!booking.selectedDate) {
        // If no selectedDate, use old logic with bookingDate
        if (booking.status === 'completed' || booking.status === 'cancelled') {
          past.push(booking);
        } else {
          current.push(booking);
        }
        return;
      }

      const bookingDate = new Date(booking.selectedDate);
      bookingDate.setHours(0, 0, 0, 0);

      if (bookingDate.getTime() === today.getTime()) {
        // Today's bookings
        if (booking.status !== 'cancelled' && booking.status !== 'completed') {
          current.push(booking);
        } else {
          past.push(booking);
        }
      } else if (bookingDate < today) {
        // Past bookings
        past.push(booking);
      } else {
        // Future bookings
        if (booking.status !== 'cancelled') {
          future.push(booking);
        } else {
          past.push(booking);
        }
      }
    });

    // Sort by date (most recent first for past, soonest first for future)
    past.sort((a, b) => {
      const dateA = a.selectedDate ? new Date(a.selectedDate).getTime() : new Date(a.bookingDate).getTime();
      const dateB = b.selectedDate ? new Date(b.selectedDate).getTime() : new Date(b.bookingDate).getTime();
      return dateB - dateA;
    });

    future.sort((a, b) => {
      const dateA = a.selectedDate ? new Date(a.selectedDate).getTime() : new Date(a.bookingDate).getTime();
      const dateB = b.selectedDate ? new Date(b.selectedDate).getTime() : new Date(b.bookingDate).getTime();
      return dateA - dateB;
    });

    current.sort((a, b) => {
      const dateA = a.selectedDate ? new Date(a.selectedDate).getTime() : new Date(a.bookingDate).getTime();
      const dateB = b.selectedDate ? new Date(b.selectedDate).getTime() : new Date(b.bookingDate).getTime();
      return dateA - dateB;
    });

    return { current, past, future };
  }
  /**
   * Update booking status (confirm, complete, etc.)
   */
  updateBookingStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed' | 'pending'): Observable<boolean> {
    return this.http.put<Booking>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getAuthHeaders() })
      .pipe(
        map(booking => {
          this.bookings.set(id, booking);
          this.saveBookingsToStorage();
          this.updateGuideBooking(booking);
          return true;
        }),
        catchError(error => {
          console.error('Error updating booking status:', error);
          const booking = this.bookings.get(id);
          if (booking) {
            booking.status = status;
            if (status === 'cancelled' && booking.paymentStatus === 'paid') {
              booking.paymentStatus = 'refunded';
            }
            this.bookings.set(id, booking);
            this.saveBookingsToStorage();
            this.updateGuideBooking(booking);
            return of(true);
          }
          return of(false);
        })
      );
  }
}