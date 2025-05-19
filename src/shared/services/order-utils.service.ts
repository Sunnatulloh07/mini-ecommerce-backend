import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { OrderFilterDto } from '../dtos/order-filter.dto';

@Injectable()
export class OrderUtilsService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates pagination metadata for listing results
   * @param total - Total number of items
   * @param page - Current page number
   * @param limit - Items per page
   * @returns Pagination metadata object
   */
  createPaginationMeta(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Builds database query conditions for orders
   * @param filterDto - Filter criteria or userId string
   * @param userId - Optional user ID to filter by
   * @returns Where condition object for Prisma query
   */
  createOrderWhereCondition(filterDto?: OrderFilterDto | string, userId?: string) {
    const where: any = { 
      isDeleted: false 
    };
    
    // Handle userId parameter
    if (typeof filterDto === 'string') {
      where.userId = filterDto;
    } else if (userId) {
      where.userId = userId;
    }
    
    // Handle filterDto if it's an object
    if (filterDto && typeof filterDto === 'object') {
      if (filterDto.status) {
        where.status = filterDto.status;
      }
    }

    return where;
  }
} 