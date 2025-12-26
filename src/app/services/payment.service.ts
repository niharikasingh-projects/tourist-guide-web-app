import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PaymentValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PaymentRequest {
  bookingId?: string;
  paymentMethod: 'upi' | 'CreditCard' | 'PayLater';
  amount: number;
  upiId?: string;
  cardNumber?: string;
  cardHolderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // Test card for demo purposes
  private readonly TEST_CARD_NUMBER = '1111111111111111';
  private apiUrl = `${environment.apiUrl}/api/payments`;
  
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Format card number with spaces every 4 digits
   */
  formatCardNumber(value: string): string {
    // Remove all spaces
    let cleanValue = value.replace(/\s/g, '');
    
    // Only allow digits
    cleanValue = cleanValue.replace(/\D/g, '');
    
    // Limit to 16 digits
    cleanValue = cleanValue.substring(0, 16);
    
    // Format with spaces every 4 digits
    return cleanValue.match(/.{1,4}/g)?.join(' ') || cleanValue;
  }

  /**
   * Validate UPI ID format
   */
  validateUpiId(upiId: string): PaymentValidationResult {
    if (!upiId || !upiId.trim()) {
      return { isValid: false, error: 'Please enter your UPI ID' };
    }

    const upiRegex = /^[\w.\-]+@[\w]+$/;
    if (!upiRegex.test(upiId)) {
      return { isValid: false, error: 'Please enter a valid UPI ID (e.g., user@paytm)' };
    }

    return { isValid: true };
  }

  /**
   * Validate credit card details
   */
  validateCreditCard(
    cardNumber: string,
    cardHolderName: string,
    expiryMonth: string,
    expiryYear: string,
    cvv: string
  ): PaymentValidationResult {
    if (!cardNumber.trim() || !cardHolderName.trim() || !expiryMonth || !expiryYear || !cvv.trim()) {
      return { isValid: false, error: 'Please fill in all card details' };
    }

    // Remove spaces from card number for validation
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    
    const cardRegex = /^[0-9]{16}$/;
    if (!cardRegex.test(cleanCardNumber)) {
      return { isValid: false, error: 'Please enter a valid 16-digit card number' };
    }

    const cvvRegex = /^[0-9]{3,4}$/;
    if (!cvvRegex.test(cvv)) {
      return { isValid: false, error: 'Please enter a valid CVV' };
    }

    return { isValid: true };
  }

  /**
   * Validate payment based on payment method
   */
  validatePayment(paymentRequest: PaymentRequest): PaymentValidationResult {
    if (paymentRequest.paymentMethod === 'PayLater') {
      return { isValid: true };
    }

    if (paymentRequest.paymentMethod === 'upi') {
      return this.validateUpiId(paymentRequest.upiId || '');
    }

    if (paymentRequest.paymentMethod === 'CreditCard') {
      return this.validateCreditCard(
        paymentRequest.cardNumber || '',
        paymentRequest.cardHolderName || '',
        paymentRequest.expiryMonth || '',
        paymentRequest.expiryYear || '',
        paymentRequest.cvv || ''
      );
    }

    return { isValid: false, error: 'Invalid payment method' };
  }

  /**
   * Process payment via backend API
   */
  processPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    // Validate payment first
    const validation = this.validatePayment(paymentRequest);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.error || 'Payment validation failed'));
    }

    // Call backend API to process payment (including pay-later)
    return this.http.post<PaymentResponse>(`${this.apiUrl}/process`, paymentRequest, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => ({
          success: true,
          transactionId: response.transactionId || this.generateTransactionId(),
          message: response.message || (paymentRequest.paymentMethod === 'PayLater' 
            ? 'Booking confirmed. Payment pending at check-in.' 
            : 'Payment processed successfully')
        })),
        catchError(error => {
          console.error('Backend payment failed, using fallback:', error);
          return this.processFallbackPayment(paymentRequest);
        })
      );
  }

  /**
   * Fallback payment processing (simulated)
   */
  private processFallbackPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    // For PayLater fallback, return success immediately
    if (paymentRequest.paymentMethod === 'PayLater') {
      return of({
        success: true,
        transactionId: this.generateTransactionId(),
        message: 'Booking confirmed. Payment pending at check-in.'
      }).pipe(delay(300));
    }

    // Check if it's the test card
    if (paymentRequest.paymentMethod === 'CreditCard') {
      const cleanCardNumber = paymentRequest.cardNumber?.replace(/\s/g, '') || '';
      if (cleanCardNumber === this.TEST_CARD_NUMBER) {
        return of({
          success: true,
          transactionId: this.generateTransactionId(),
          message: 'Test payment successful'
        }).pipe(delay(800));
      }
    }

    // Simulate payment processing
    return of({
      success: true,
      transactionId: this.generateTransactionId(),
      message: 'Payment processed successfully'
    }).pipe(delay(1500));
  }

  /**
   * Generate a mock transaction ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TXN${timestamp}${random}`;
  }

  /**
   * Check if card number is the test card
   */
  isTestCard(cardNumber: string): boolean {
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    return cleanCardNumber === this.TEST_CARD_NUMBER;
  }
}
