import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class AdminCategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new category with the provided data
   */
  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = await this.prismaService.category.create({
      data: createCategoryDto,
    });

    return category;
  }

  /**
   * Retrieves all categories with pagination
   */
  async getAllCategories(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    
    const [categories, total] = await Promise.all([
      this.prismaService.category.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
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
   * Finds a category by its ID
   */
  async getCategory(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /**
   * Updates a category's details
   */
  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const updatedCategory = await this.prismaService.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return updatedCategory;
  }

  /**
   * Retrieves all products associated with a specific category
   */
  async getCategoryProducts(id: string, paginationDto: PaginationDto) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      this.prismaService.product.findMany({
        where: {
          categories: {
            some: {
              categoryId: id,
            },
          },
          isDeleted: false,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.product.count({
        where: {
          categories: {
            some: {
              categoryId: id,
            },
          },
          isDeleted: false,
        },
      }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Deletes a category and removes all its associations with products
   */
  async deleteCategory(id: string) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.prismaService.productOnCategory.deleteMany({
      where: { categoryId: id },
    });

    await this.prismaService.category.delete({
      where: { id },
    });

    return { success: true, message: 'Category deleted successfully' };
  }
}