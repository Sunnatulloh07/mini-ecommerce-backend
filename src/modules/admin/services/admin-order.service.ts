import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { OrderStatusEnum } from '../../../shared/constants/order-status.constant';
import { OrderFilterDto } from '../../../shared/dtos/order-filter.dto';
import { OrderUtilsService } from '../../../shared/services/order-utils.service';

@Injectable()
export class AdminOrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderUtilsService: OrderUtilsService
  ) {}

  /**
   * Retrieves all orders with pagination, filtering, and full relation data
   */
  async getAllOrders(
    { page = 1, limit = 10 }: PaginationDto,
    filterDto: OrderFilterDto
  ) {
    const skip = (page - 1) * limit;

    const where = this.orderUtilsService.createOrderWhereCondition(filterDto);

    const [orders, total] = await Promise.all([
      this.prismaService.order.findMany({
        skip,
        take: limit,
        where,
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
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  image: true
                }
              }
            }
          },
          Payment: {
            select: {
              id: true,
              status: true,
              amount: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prismaService.order.count({ where })
    ]);

    return {
      data: orders,
      meta: this.orderUtilsService.createPaginationMeta(total, page, limit),
    };
  }

  /**
   * Retrieves a specific order with all related data
   */
  async getOrder(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id, isDeleted: false },
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
        },
        Payment: true
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Updates the status of an existing order
   */
  async updateOrderStatus(id: string, status: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id, isDeleted: false }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prismaService.order.update({
      where: { id },
      data: { status }
    });
  }

  /**
   * Soft deletes an order by marking it as deleted
   */
  async deleteOrder(id: string) {
    const order = await this.prismaService.order.findUnique({
      where: { id, isDeleted: false }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prismaService.order.update({
      where: { id },
      data: { isDeleted: true }
    });
  }

  /**
   * Retrieves all orders for a specific user with pagination
   */
  async getUserOrders(userId: string, { page = 1, limit = 10 }: PaginationDto) {

    const user = await this.prismaService.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skip = (page - 1) * limit;
    
    const where = this.orderUtilsService.createOrderWhereCondition({}, userId);

    const [orders, total] = await Promise.all([
      this.prismaService.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: true
            }
          },
          Payment: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prismaService.order.count({ where })
    ]);

    return {
      data: orders,
      meta: this.orderUtilsService.createPaginationMeta(total, page, limit),
    };
  }

  /**
   * Retrieves all orders containing a specific product
   */
  async getOrdersByProduct(productId: string, { page = 1, limit = 10 }: PaginationDto) {

    const product = await this.prismaService.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const skip = (page - 1) * limit;

    const orderItems = await this.prismaService.orderItem.findMany({
      where: {
        productId,
        order: {
          isDeleted: false
        }
      },
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
            Payment: true,
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    price: true,
                    image: true
                  }
                }
              }
            }
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const total = await this.prismaService.orderItem.count({
      where: {
        productId,
        order: {
          isDeleted: false
        }
      }
    });

    const orderIds = new Set<string>();
    const orders: any[] = [];

    orderItems.forEach(item => {
      if (!orderIds.has(item.order.id)) {
        orderIds.add(item.order.id);
        orders.push(item.order);
      }
    });

    return {
      data: orders,
      meta: this.orderUtilsService.createPaginationMeta(total, page, limit),
    };
  }

  /**
   * Retrieves order statistics for analytics
   */
  async getOrderStatistics() {
    const totalOrders = await this.prismaService.order.count({
      where: { isDeleted: false }
    });
    
    const ordersByStatus = await Promise.all(
      Object.values(OrderStatusEnum).map(async (status) => {
        const count = await this.prismaService.order.count({
          where: { status, isDeleted: false }
        });
        return { status, count };
      })
    );

    const totalRevenue = await this.prismaService.order.aggregate({
      _sum: { totalPrice: true },
      where: { isDeleted: false }
    });

    const paidOrdersRevenue = await this.prismaService.order.aggregate({
      _sum: { totalPrice: true },
      where: { 
        status: OrderStatusEnum.PAID,
        isDeleted: false
      }
    });

    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    
    const lastWeekOrders = await this.prismaService.order.count({
      where: {
        createdAt: {
          gte: lastWeekDate
        },
        isDeleted: false
      }
    });

    const topProducts = await this.prismaService.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prismaService.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            title: true,
            price: true,
            image: true
          }
        });
        return {
          ...product,
          totalQuantity: item._sum.quantity
        };
      })
    );

    return {
      total: {
        count: totalOrders,
        revenue: totalRevenue._sum.totalPrice || 0
      },
      byStatus: ordersByStatus.reduce((acc, { status, count }) => {
        acc[status] = count;
        return acc;
      }, {}),
      paidOrders: {
        revenue: paidOrdersRevenue._sum.totalPrice || 0,
        percentage: totalOrders > 0 ? 
          (ordersByStatus.find(o => o.status === OrderStatusEnum.PAID)?.count || 0) / totalOrders * 100 : 0
      },
      lastWeek: {
        count: lastWeekOrders
      },
      topProducts: topProductsWithDetails
    };
  }

  /**
   * Retrieves daily orders report for analytics
   */
  async getDailyOrdersReport(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.prismaService.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        isDeleted: false
      },
      select: {
        status: true,
        totalPrice: true,
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
        revenue: 0,
        byStatus: Object.values(OrderStatusEnum).reduce((acc: any, status) => {
          acc[status] = 0;
          return acc;
        }, {})
      };
    }

    orders.forEach(order => {
      const dateString = order.createdAt.toISOString().split('T')[0];
      
      if (!dailyData[dateString]) {
        dailyData[dateString] = {
          date: dateString,
          total: 0,
          revenue: 0,
          byStatus: Object.values(OrderStatusEnum).reduce((acc: any, status) => {
            acc[status] = 0;
            return acc;
          }, {})
        };
      }
      
      dailyData[dateString].total += 1;
      dailyData[dateString].revenue += Number(order.totalPrice);
      dailyData[dateString].byStatus[order.status] += 1;
    });

    const result = Object.values(dailyData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      days,
      data: result,
    };
  }
}
