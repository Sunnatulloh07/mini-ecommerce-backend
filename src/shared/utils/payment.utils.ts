export class PaymentUtils {
  static isEvenCardNumber(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanNumber.length === 16 && /^\d+$/.test(cleanNumber)) {
      return true;
    }
    
    return false;
  }
}