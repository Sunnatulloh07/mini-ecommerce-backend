import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Retrieves all categories with pagination
   */
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      this.prismaService.category.findMany({
        take: limit,
        skip,
        orderBy: { name: 'asc' }
      }),
      this.prismaService.category.count(),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a category by its ID
   */
  async findOne(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /**
   * Retrieves products by category with pagination
   */
  async findProductsByCategory(id: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const categoryExists = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!categoryExists) {
      throw new NotFoundException('Category not found');
    }

    const productsWithCategory = await this.prismaService.productOnCategory.findMany({
      where: { categoryId: id },
      skip,
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            image: true,
            description: true,
            isActive: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true,
            categories: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    const total = await this.prismaService.productOnCategory.count({
      where: { categoryId: id },
    });

    const products = productsWithCategory
      .filter(pc => !pc.product.isDeleted && pc.product.isActive)
      .map(pc => {
        const { product } = pc;
        return {
          ...product,
          categories: product.categories.map(c => c.category)
        };
      });

    return {
      data: products,
      meta: {
        total: products.length,
        page,
        limit,
        totalPages: Math.ceil(products.length / limit),
      },
    };
  }
}
