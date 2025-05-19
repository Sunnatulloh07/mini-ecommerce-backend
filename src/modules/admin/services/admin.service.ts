import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Retrieves overall statistics
   */
  async getStatistics() {
    const usersCount = await this.prismaService.user.count({
      where: { isDeleted: false }
    });

    const productsCount = await this.prismaService.product.count({
      where: { isDeleted: false }
    });

    const ordersCount = await this.prismaService.order.count({
      where: { isDeleted: false }
    });

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

    const newOrdersCount = await this.prismaService.order.count({
      where: {
        isDeleted: false,
        createdAt: { gte: lastMonthDate }
      }
    });

    const totalRevenue = await this.prismaService.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' }
    });

    const activeUsersCount = await this.prismaService.user.count({
      where: { isActive: true, isDeleted: false }
    });

    return {
      users: {
        total: usersCount,
        active: activeUsersCount
      },
      products: {
        total: productsCount
      },
      orders: {
        total: ordersCount,
        newOrders: newOrdersCount
      },
      revenue: {
        total: totalRevenue._sum.amount || 0
      }
    };
  }

  /**
   * Retrieves users with pagination
   */
  async getUsers({ page = 1, limit = 10 }: PaginationDto) {
    const skip = (page - 1) * limit;

    const users = await this.prismaService.user.findMany({
      skip,
      take: limit,
      where: { isDeleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await this.prismaService.user.count({
      where: { isDeleted: false }
    });

    return {
      data: users.map(user => ({
        ...user,
        ordersCount: user._count.orders
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Toggles user block status
   */
  async toggleUserBlock(id: string, isActive: boolean) {
    const user = await this.prismaService.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prismaService.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true
      }
    });
  }

  /**
   * Retrieves orders with pagination
   */
  async getOrders({ page = 1, limit = 10 }: PaginationDto) {
    const skip = (page - 1) * limit;

    const orders = await this.prismaService.order.findMany({
      skip,
      take: limit,
      where: { isDeleted: false },
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
                price: true
              }
            }
          }
        },
        Payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await this.prismaService.order.count({
      where: { isDeleted: false }
    });

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Retrieves products with pagination
   */
  async getProducts({ page = 1, limit = 10 }: PaginationDto) {
    const skip = (page - 1) * limit;

    const products = await this.prismaService.product.findMany({
      skip,
      take: limit,
      where: { isDeleted: false },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: { orderItems: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = await this.prismaService.product.count({
      where: { isDeleted: false }
    });

    return {
      data: products.map(product => ({
        ...product,
        categories: product.categories.map(pc => pc.category),
        orderCount: product._count.orderItems
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}