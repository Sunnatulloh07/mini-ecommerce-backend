import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { OrderStatusEnum } from '../../../shared/constants/order-status.constant';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService
  ) {}

  /**
   * Creates a new order with multiple product items and calculates the total price
   */
  async create(userId: string, createOrderDto: CreateOrderDto) {
    const orderItems: { productId: string; quantity: number; price: number }[] = [];
    let totalPrice = 0;

    for (const item of createOrderDto.items) {
      const product = await this.prismaService.product.findUnique({
        where: { 
          id: item.productId,
          isActive: true,
          isDeleted: false
        }
      });

      if (!product) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      });

      totalPrice += product.price * item.quantity;
    }

    const order = await this.prismaService.order.create({
      data: {
        userId,
        totalPrice,
        status: OrderStatusEnum.PENDING,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return order;
  }

  /**
   * Retrieves all orders for a specific user with pagination
   */
  async findAll(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      isDeleted: false
    };

    const [orders, total] = await Promise.all([
      this.prismaService.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
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
              paymentMethod: true,
              createdAt: true
            }
          }
        }
      }),
      this.prismaService.order.count({ where })
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a specific order with all its items and payment information
   */
  async findOne(id: string, userId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { 
        id,
        userId,
        isDeleted: false
      },
      include: {
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
   * Cancels an order if it hasn't been shipped or delivered yet
   */
  async cancel(id: string, userId: string) {
    const order = await this.prismaService.order.findUnique({
      where: { 
        id,
        userId,
        isDeleted: false
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatusEnum.SHIPPED || order.status === OrderStatusEnum.DELIVERED) {
      throw new BadRequestException('Cannot cancel shipped or delivered orders');
    }

    return this.prismaService.order.update({
      where: { id },
      data: { status: OrderStatusEnum.CANCELLED }
    });
  }
}