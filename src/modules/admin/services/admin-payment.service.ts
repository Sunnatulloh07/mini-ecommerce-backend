import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { OrderStatusEnum } from '../../../shared/constants/order-status.constant';
import { PaymentQueryDto } from '../dto/payment-query.dto';
import { PaymentStatus } from 'generated/prisma';


@Injectable()
export class AdminPaymentService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Retrieves all payments with pagination, filtering, and full relation data
   */
  async getAllPayments(
    { page = 1, limit = 10 }: PaginationDto,
    { status, dateFrom, dateTo }: PaymentQueryDto
  ) {
    const skip = (page - 1) * limit;

    // Filter sharti
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [payments, total] = await Promise.all([
      this.prismaService.payment.findMany({
        skip,
        take: limit,
        where,
        include: {
          order: {
            select: {
              id: true,
              userId: true,
              status: true,
              totalPrice: true,
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prismaService.payment.count({ where })
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a payment by ID with associated order and user details
   */
  async getPayment(id: string) {
    const payment = await this.prismaService.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Updates the status of a payment
   */
  async updatePaymentStatus(id: string, status: string) {
    const payment = await this.prismaService.payment.findUnique({
      where: { id },
      include: {
        order: true
      }
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    let paymentStatus: PaymentStatus;
    
    if (status === 'SUCCESS') {
      paymentStatus = PaymentStatus.SUCCESS;
    } else if (status === 'FAILED') {
      paymentStatus = PaymentStatus.FAILED;
    } else if (status === 'PENDING') {
      paymentStatus = PaymentStatus.PENDING;
    } else {
      throw new BadRequestException('Invalid payment status');
    }

    const updatedPayment = await this.prismaService.payment.update({
      where: { id },
      data: { status: paymentStatus }
    });

    if (paymentStatus === PaymentStatus.SUCCESS) {
      await this.prismaService.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' }
      });
    } else if (paymentStatus === PaymentStatus.FAILED) {
      await this.prismaService.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAYMENT_FAILED' }
      });
    }

    return updatedPayment;
  }

  /**
   * Retrieves a summary of payment statistics
   */
  async getPaymentsSummary() {
    const totalPayments = await this.prismaService.payment.count();
    
    const successPayments = await this.prismaService.payment.count({
      where: { status: 'SUCCESS' },
    });
    
    const pendingPayments = await this.prismaService.payment.count({
      where: { status: 'PENDING' },
    });
    
    const failedPayments = await this.prismaService.payment.count({
      where: { status: 'FAILED' },
    });

    const totalRevenue = await this.prismaService.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' },
    });

    const averagePayment = await this.prismaService.payment.aggregate({
      _avg: { amount: true },
      where: { status: 'SUCCESS' },
    });

    return {
      total: {
        count: totalPayments,
        revenue: totalRevenue._sum.amount || 0,
        averageAmount: averagePayment._avg.amount || 0,
      },
      byStatus: {
        success: successPayments,
        pending: pendingPayments,
        failed: failedPayments,
      },
      successRate: totalPayments > 0 ? (successPayments / totalPayments) * 100 : 0,
    };
  }

  /**
   * Retrieves daily payments report for a specified number of days
   */
  async getDailyPaymentsReport(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const payments = await this.prismaService.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        status: true,
        amount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    const dailyData = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateString = date.toISOString().split('T')[0];
      dailyData[dateString] = {
        date: dateString,
        total: 0,
        success: 0,
        failed: 0,
        pending: 0,
        revenue: 0,
      };
    }

    payments.forEach(payment => {
      const dateString = payment.createdAt.toISOString().split('T')[0];
      
      if (!dailyData[dateString]) {
        dailyData[dateString] = {
          date: dateString,
          total: 0,
          success: 0,
          failed: 0,
          pending: 0,
          revenue: 0,
        };
      }
      
      dailyData[dateString].total += 1;
      
      if (payment.status === 'SUCCESS') {
        dailyData[dateString].success += 1;
        dailyData[dateString].revenue += Number(payment.amount);
      } else if (payment.status === 'FAILED') {
        dailyData[dateString].failed += 1;
      } else {
        dailyData[dateString].pending += 1;
      }
    });

    const result = Object.values(dailyData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      days,
      data: result,
    };
  }

  /**
   * Retrieves payments by user with pagination
   */
  async getPaymentsByUser(userId: string, { page = 1, limit = 10 }: PaginationDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;

    const ordersWithPayments = await this.prismaService.order.findMany({
      where: { userId },
      include: {
        Payment: true
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const payments = ordersWithPayments
      .filter(order => order.Payment)
      .map(order => order.Payment);

    const total = await this.prismaService.order.count({
      where: { 
        userId,
        Payment: {
          isNot: null
        }
      }
    });

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves payment statistics
   */
  async getPaymentStatistics() {
    const totalPayments = await this.prismaService.payment.count();
    
    const successfulPayments = await this.prismaService.payment.count({
      where: { status: 'SUCCESS' }
    });
    
    const failedPayments = await this.prismaService.payment.count({
      where: { status: 'FAILED' }
    });
    
    const pendingPayments = await this.prismaService.payment.count({
      where: { status: 'PENDING' }
    });
    
    const totalRevenue = await this.prismaService.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' }
    });

    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    
    const lastWeekPayments = await this.prismaService.payment.count({
      where: {
        createdAt: {
          gte: lastWeekDate
        }
      }
    });

    const lastWeekRevenue = await this.prismaService.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: 'SUCCESS',
        createdAt: {
          gte: lastWeekDate
        }
      }
    });

    return {
      total: {
        count: totalPayments,
        revenue: totalRevenue._sum.amount || 0
      },
      successful: {
        count: successfulPayments,
        percentage: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0
      },
      failed: {
        count: failedPayments,
        percentage: totalPayments > 0 ? (failedPayments / totalPayments) * 100 : 0
      },
      pending: {
        count: pendingPayments,
        percentage: totalPayments > 0 ? (pendingPayments / totalPayments) * 100 : 0
      },
      lastWeek: {
        count: lastWeekPayments,
        revenue: lastWeekRevenue._sum.amount || 0
      }
    };
  }
}