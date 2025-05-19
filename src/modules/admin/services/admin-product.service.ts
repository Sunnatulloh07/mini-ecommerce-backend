import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class AdminProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileUploadService: FileUploadService
  ) {}

  /**
   * Creates a new product with uploaded image and connects it to specified categories
   */
  async createProduct(createProductDto: CreateProductDto, file: Express.Multer.File) {
    const imageUrl = this.fileUploadService.uploadFile(file, 'products');

    const { title, price, description, categoryIds } = createProductDto;

    const product = await this.prismaService.product.create({
      data: {
        title,
        price: parseFloat(price.toString()),
        description,
        image: imageUrl,
      },
    });

    if (categoryIds && categoryIds.length > 0) {
      const categoryConnections = categoryIds.map(categoryId => ({
        productId: product.id,
        categoryId,
      }));

      await this.prismaService.productOnCategory.createMany({
        data: categoryConnections,
      });
    }

    return this.getProduct(product.id);
  }

  /**
   * Retrieves all products with pagination and category information
   */
  async getAllProducts(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      this.prismaService.product.findMany({
        where: { isDeleted: false },
        skip,
        take: limit,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prismaService.product.count({
        where: { isDeleted: false },
      }),
    ]);

    const formattedProducts = products.map(product => ({
      ...product,
      categories: product.categories.map(pc => pc.category),
    }));

    return {
      data: formattedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Finds a product by its ID with category information
   */
  async getProduct(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id, isDeleted: false },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...product,
      categories: product.categories.map(pc => pc.category),
    };
  }

  /**
   * Updates a product's details and optionally changes its image and category associations
   */
  async updateProduct(id: string, updateProductDto: UpdateProductDto, file?: Express.Multer.File) {
    const product = await this.prismaService.product.findUnique({
      where: { id, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updateData: any = {};

    if (file) {
      updateData.image = this.fileUploadService.uploadFile(file, 'products');
    }

    if (updateProductDto.title) updateData.title = updateProductDto.title;
    if (updateProductDto.price) updateData.price = parseFloat(updateProductDto.price.toString());
    if (updateProductDto.description) updateData.description = updateProductDto.description;

    const updatedProduct = await this.prismaService.product.update({
      where: { id },
      data: updateData,
    });

    if (updateProductDto.categoryIds && updateProductDto.categoryIds.length > 0) {
      await this.prismaService.productOnCategory.deleteMany({
        where: { productId: id },
      });

      const categoryConnections = updateProductDto.categoryIds.map(categoryId => ({
        productId: id,
        categoryId,
      }));

      await this.prismaService.productOnCategory.createMany({
        data: categoryConnections,
      });
    }

    return this.getProduct(id);
  }

  /**
   * Soft deletes a product by marking it as deleted
   */
  async deleteProduct(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prismaService.product.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { success: true, message: 'Product deleted successfully' };
  }
}