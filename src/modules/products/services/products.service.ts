import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { ProductFilterDto } from '../dto/product-filter.dto';
import { ProductResponseDto } from '../dto/product-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService
  ) {}

  /**
   * Retrieves paginated list of products with advanced filtering and sorting options
   */
  async findAll(
    paginationDto: PaginationDto, 
    filterDto: ProductFilterDto
  ): Promise<{ data: ProductResponseDto[], meta: any }> {
    const { page = 1, limit = 10 } = paginationDto;
    const { 
      search, 
      categoryId,
      minPrice,
      maxPrice,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = filterDto;
    
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
      isActive: true,
    };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (categoryId) {
      where.categories = {
        some: {
          categoryId
        }
      };
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const products = await this.prismaService.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    const total = await this.prismaService.product.count({ where });

    const formattedProducts = products.map(product => ({
      ...product,
      categories: product.categories.map(pc => pc.category)
    }));

    return {
      data: formattedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Retrieves detailed information about a specific product including its categories
   */
  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.prismaService.product.findUnique({
      where: { 
        id, 
        isDeleted: false,
        isActive: true
      },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundException('Book not found');
    }

    return {
      ...product,
      categories: product.categories.map(pc => pc.category)
    };
  }

  /**
   * Retrieves products belonging to a specific category with pagination
   */
  async findByCategory(
    categoryId: string, 
    paginationDto: PaginationDto
  ): Promise<{ data: ProductResponseDto[], meta: any }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const category = await this.prismaService.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const products = await this.prismaService.product.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        categories: {
          some: {
            categoryId
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        categories: {
          include: {
            category: true
          }
        }
      }
    });

    const total = await this.prismaService.product.count({
      where: {
        isDeleted: false,
        isActive: true,
        categories: {
          some: {
            categoryId
          }
        }
      }
    });

    const formattedProducts = products.map(product => ({
      ...product,
      categories: product.categories.map(pc => pc.category)
    }));

    return {
      data: formattedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        category: {
          id: category.id,
          name: category.name,
          description: category.description
        }
      }
    };
  }
} 