import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OrderStatusEnum } from '../../../shared/constants/order-status.constant';
import { PaymentUtils } from '../../../shared/utils/payment.utils';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResultDto } from '../dto/payment-result.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Processes a payment
   */
  async processPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentResultDto> {
    const { orderId, cardNumber, amount, paymentMethod } = createPaymentDto;

    const order = await this.prismaService.order.findUnique({
      where: { 
        id: orderId,
        isDeleted: false
      },
      include: {
        Payment: true
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Allow new payment if previous payment failed or no payment exists
    if (order.Payment && order.status !== OrderStatusEnum.PAYMENT_FAILED) {
      throw new ConflictException('Payment for this order has already been processed successfully');
    }

    if (order.totalPrice !== amount) {
      throw new BadRequestException('Payment amount does not match the order price');
    }

    // Validate card number format
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.length !== 16 || !/^\d+$/.test(cleanNumber)) {
      throw new BadRequestException('Card number must be exactly 16 digits');
    }

    const isEven = PaymentUtils.isEvenCardNumber(cardNumber);
    const status = isEven ? 'SUCCESS' : 'FAILED';
    
    const transactionId = `TRX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // If there's already a failed payment, update it instead of creating a new one
    let payment;
    if (order.Payment && order.status === OrderStatusEnum.PAYMENT_FAILED) {
      payment = await this.prismaService.payment.update({
        where: { id: order.Payment.id },
        data: {
          amount,
          status,
          paymentMethod,
          transactionId,
        }
      });
    } else {
      payment = await this.prismaService.payment.create({
        data: {
          orderId,
          amount,
          status,
          paymentMethod,
          transactionId,
        }
      });
    }

    await this.prismaService.order.update({
      where: { id: orderId },
      data: { 
        status: isEven ? OrderStatusEnum.PAID : OrderStatusEnum.PAYMENT_FAILED
      },
    });

    return {
      success: isEven,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        transactionId: payment.transactionId || ''
      },
      message: isEven 
        ? 'Payment successful' 
        : 'Payment failed - Card number must be exactly 16 digits'
    };
  }

  /**
   * Retrieves payment information for an order
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentResponseDto> {
    const payment = await this.prismaService.payment.findUnique({
      where: { orderId }
    });

    if (!payment) {
        throw new NotFoundException('Payment information not found');
    }

    return payment as PaymentResponseDto;
  }

  /**
   * Retrieves all payments for a user
   */
  async getUserPayments(userId: string): Promise<PaymentResponseDto[]> {
    const orders = await this.prismaService.order.findMany({
      where: {
        userId,
        isDeleted: false,
        Payment: {
          isNot: null
        }
      },
      select: {
        id: true
      }
    });

    const orderIds = orders.map(order => order.id);

    const payments = await this.prismaService.payment.findMany({
      where: {
        orderId: {
          in: orderIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return payments as unknown as PaymentResponseDto[];
  }

  /**
   * Retrieves payment information by ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentResponseDto> {
    const payment = await this.prismaService.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new NotFoundException('Payment information not found');
    }

    return payment as PaymentResponseDto;
  }

  /**
   * Updates payment status
   * For example, if a payment is made with a wallet, the status is updated
   */
  async updatePaymentStatus(paymentId: string, status: string): Promise<PaymentResponseDto> {
    const payment = await this.prismaService.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new NotFoundException('Payment information not found');
    }

    const updatedPayment = await this.prismaService.payment.update({
      where: { id: paymentId },
      data: { status: status as any }
    });

    await this.prismaService.order.update({
      where: { id: payment.orderId },
      data: { 
        status: status === 'SUCCESS' ? OrderStatusEnum.PAID : OrderStatusEnum.PAYMENT_FAILED 
      }
    });

    return updatedPayment as PaymentResponseDto;
  }
}
