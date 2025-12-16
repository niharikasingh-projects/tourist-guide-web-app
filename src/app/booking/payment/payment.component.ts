import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { HeaderComponent } from '../../layout/header/header.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { TouristAttraction } from '../../services/search.service';
import { Guide } from '../../services/guide.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  attraction: TouristAttraction | null = null;
  guide: Guide | null = null;
  selectedDate: Date | null = null;
  customerName = '';
  customerContact = '';
  customerEmail = '';
  hoursBooked = 1;

  // Payment details
  paymentMethod: 'upi' | 'credit-card' | 'pay-later' = 'upi';
  showPayNowOptions = true;
  
  // UPI details
  upiId = '';
  
  // Credit card details
  cardNumber = '';
  cardHolderName = '';
  expiryMonth = '';
  expiryYear = '';
  cvv = '';

  isProcessing = false;
  error = '';

  constructor(
    private router: Router,
    private bookingService: BookingService
  ) {
    // Get booking data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state;
      this.attraction = state['attraction'];
      this.guide = state['guide'];
      this.selectedDate = state['selectedDate'];
      this.customerName = state['customerName'];
      this.customerContact = state['customerContact'];
      this.customerEmail = state['customerEmail'];
      this.hoursBooked = state['hoursBooked'];
    }
  }

  ngOnInit() {
    // If no data in state, check if we can get it from history
    if (!this.attraction || !this.guide) {
      const state = history.state;
      if (state?.attraction && state?.guide) {
        this.attraction = state.attraction;
        this.guide = state.guide;
        this.selectedDate = state.selectedDate;
        this.customerName = state.customerName;
        this.customerContact = state.customerContact;
        this.customerEmail = state.customerEmail;
        this.hoursBooked = state.hoursBooked;
      } else {
        // No booking data, redirect to home
        this.router.navigate(['/']);
      }
    }
  }

  get subtotal(): number {
    if (!this.guide) return 0;
    return this.guide.hourlyRate * this.hoursBooked;
  }

  get cgst(): number {
    return this.subtotal * 0.14;
  }

  get sgst(): number {
    return this.subtotal * 0.14;
  }

  get totalTax(): number {
    return this.cgst + this.sgst;
  }

  get totalAmount(): number {
    return this.subtotal + this.totalTax;
  }

  selectPaymentMethod(method: 'pay-now' | 'pay-later') {
    if (method === 'pay-now') {
      this.showPayNowOptions = true;
      this.paymentMethod = 'upi'; // Default to UPI
    } else {
      this.showPayNowOptions = false;
      this.paymentMethod = 'pay-later';
    }
  }

  selectPayNowOption(option: 'upi' | 'credit-card') {
    this.paymentMethod = option;
  }

  validatePayment(): boolean {
    if (this.paymentMethod === 'pay-later') {
      return true;
    }

    if (this.paymentMethod === 'upi') {
      if (!this.upiId.trim()) {
        this.error = 'Please enter your UPI ID';
        return false;
      }
      const upiRegex = /^[\w.\-]+@[\w]+$/;
      if (!upiRegex.test(this.upiId)) {
        this.error = 'Please enter a valid UPI ID (e.g., user@paytm)';
        return false;
      }
    }

    if (this.paymentMethod === 'credit-card') {
      if (!this.cardNumber.trim() || !this.cardHolderName.trim() || 
          !this.expiryMonth || !this.expiryYear || !this.cvv.trim()) {
        this.error = 'Please fill in all card details';
        return false;
      }
      
      const cardRegex = /^[0-9]{16}$/;
      if (!cardRegex.test(this.cardNumber.replace(/\s/g, ''))) {
        this.error = 'Please enter a valid 16-digit card number';
        return false;
      }

      const cvvRegex = /^[0-9]{3,4}$/;
      if (!cvvRegex.test(this.cvv)) {
        this.error = 'Please enter a valid CVV';
        return false;
      }
    }

    return true;
  }

  confirmPayment() {
    this.error = '';

    if (!this.validatePayment()) {
      return;
    }

    if (!this.attraction || !this.guide) {
      this.error = 'Missing booking information';
      return;
    }

    this.isProcessing = true;

    const bookingData = {
      attractionId: this.attraction.id,
      attractionName: this.attraction.name,
      guideId: this.guide.id,
      guideName: this.guide.name,
      guideContact: this.guide.phoneNumber || 'N/A',
      guideEmail: this.guide.email || 'N/A',
      customerName: this.customerName,
      customerContact: this.customerContact,
      customerEmail: this.customerEmail,
      selectedDate: this.selectedDate,
      hoursBooked: this.hoursBooked,
      subtotal: this.subtotal,
      cgst: this.cgst,
      sgst: this.sgst,
      totalTax: this.totalTax,
      amount: this.totalAmount,
      paymentMethod: this.paymentMethod,
      paymentStatus: (this.paymentMethod === 'pay-later' ? 'pending' : 'paid') as 'paid' | 'pending'
    };

    this.bookingService.createBooking(bookingData).subscribe({
      next: (booking) => {
        this.isProcessing = false;
        this.router.navigate(['/booking-confirmation', booking.id]);
      },
      error: (err) => {
        this.error = 'Failed to process booking. Please try again.';
        this.isProcessing = false;
      }
    });
  }

  goBack() {
    if (this.attraction && this.guide) {
      this.router.navigate(['/checkout', this.attraction.id, this.guide.id], {
        state: {
          customerName: this.customerName,
          customerContact: this.customerContact,
          customerEmail: this.customerEmail,
          hoursBooked: this.hoursBooked
        }
      });
    } else {
      this.router.navigate(['/']);
    }
  }
}
