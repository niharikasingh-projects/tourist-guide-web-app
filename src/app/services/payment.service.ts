import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface PaymentValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PaymentRequest {
  paymentMethod: 'upi' | 'credit-card' | 'pay-later';
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
  
  constructor() {}

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
    if (paymentRequest.paymentMethod === 'pay-later') {
      return { isValid: true };
    }

    if (paymentRequest.paymentMethod === 'upi') {
      return this.validateUpiId(paymentRequest.upiId || '');
    }

    if (paymentRequest.paymentMethod === 'credit-card') {
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
   * Process payment (simulated for now, can be replaced with real API call)
   */
  processPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    // Validate payment first
    const validation = this.validatePayment(paymentRequest);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.error || 'Payment validation failed'));
    }

    // For pay-later, immediately return success
    if (paymentRequest.paymentMethod === 'pay-later') {
      return of({
        success: true,
        transactionId: this.generateTransactionId(),
        message: 'Booking confirmed. Payment pending at check-in.'
      }).pipe(delay(300));
    }

    // Check if it's the test card
    if (paymentRequest.paymentMethod === 'credit-card') {
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
    // In real implementation, this would call a payment gateway API
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
