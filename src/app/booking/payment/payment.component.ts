import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { PaymentService } from '../../services/payment.service';
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
  timeFrom = '';
  timeTo = '';
  customerName = '';
  customerContact = '';
  customerEmail = '';
  hoursBooked = 1;

  // Payment details
  paymentMethod: 'upi' | 'CreditCard' | 'PayLater' = 'upi';
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
    private bookingService: BookingService,
    private paymentService: PaymentService
  ) {
    // Get booking data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state;
      this.attraction = state['attraction'];
      this.guide = state['guide'];
      this.selectedDate = state['selectedDate'];
      this.timeFrom = state['timeFrom'] || '';
      this.timeTo = state['timeTo'] || '';
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
        this.timeFrom = state.timeFrom || '';
        this.timeTo = state.timeTo || '';
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

  selectPaymentMethod(method: 'pay-now' | 'PayLater') {
    if (method === 'pay-now') {
      this.showPayNowOptions = true;
      this.paymentMethod = 'upi'; // Default to UPI
    } else {
      this.showPayNowOptions = false;
      this.paymentMethod = 'PayLater';
    }
  }

  selectPayNowOption(option: 'upi' | 'CreditCard') {
    this.paymentMethod = option;
  }

  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    this.cardNumber = this.paymentService.formatCardNumber(input.value);
    
    // Update cursor position
    setTimeout(() => {
      const newPosition = this.cardNumber.length;
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
  }

  validatePayment(): boolean {
    const validationResult = this.paymentService.validatePayment({
      paymentMethod: this.paymentMethod,
      amount: this.totalAmount,
      upiId: this.upiId,
      cardNumber: this.cardNumber,
      cardHolderName: this.cardHolderName,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      cvv: this.cvv
    });

    if (!validationResult.isValid) {
      this.error = validationResult.error || 'Payment validation failed';
      return false;
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

    // Prepare payment request
    const paymentRequest = {
      paymentMethod: this.paymentMethod,
      amount: this.totalAmount,
      upiId: this.upiId,
      cardNumber: this.cardNumber,
      cardHolderName: this.cardHolderName,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      cvv: this.cvv
    };

    // Prepare booking data
    const paymentStatus: 'completed' | 'pending' = this.paymentMethod === 'PayLater' ? 'pending' : 'completed';
    const bookingData = {
      attractionId: this.attraction.id,
      attractionName: this.attraction.attractionName,
      guideId: this.guide.id,
      guideName: this.guide.name,
      guideContact: this.guide.phoneNumber || 'N/A',
      guideEmail: this.guide.email || 'N/A',
      customerName: this.customerName,
      customerContact: this.customerContact,
      customerEmail: this.customerEmail,
      selectedDate: this.selectedDate,
      timeFrom: this.timeFrom,
      timeTo: this.timeTo,
      hoursBooked: this.hoursBooked,
      subtotal: this.subtotal,
      cgst: this.cgst,
      sgst: this.sgst,
      totalTax: this.totalTax,
      amount: this.totalAmount,
      paymentMethod: this.paymentMethod,
      paymentStatus: paymentStatus
    };

    // Create booking with payment integration (payment will be processed first in service)
    this.bookingService.createBooking(bookingData, paymentRequest).subscribe({
      next: (booking) => {
        this.isProcessing = false;
        this.router.navigate(['/booking-confirmation', booking.id]);
      },
      error: (err) => {
        this.error = err.message || 'Failed to process payment and booking. Please try again.';
        this.isProcessing = false;
      }
    });
  }

  goBack() {
    if (this.attraction && this.guide) {
      const queryParams: any = {};
      if (this.selectedDate) queryParams.date = this.selectedDate.toISOString().split('T')[0];
      if (this.timeFrom) queryParams.timeFrom = this.timeFrom;
      if (this.timeTo) queryParams.timeTo = this.timeTo;
      
      this.router.navigate(['/checkout', this.attraction.id, this.guide.id], {
        queryParams,
        state: {
          customerName: this.customerName,
          customerContact: this.customerContact,
          customerEmail: this.customerEmail
        }
      });
    } else {
      this.router.navigate(['/']);
    }
  }
}
