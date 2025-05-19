import { 
    Controller, 
    Post, 
    Body, 
    UseGuards, 
    UseInterceptors,
    UploadedFile,
    Get,
    Param,
    ParseUUIDPipe,
    Put,
    Delete,
    Query
  } from '@nestjs/common';
  import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiBearerAuth, 
    ApiConsumes, 
    ApiBody 
  } from '@nestjs/swagger';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
  import { RolesGuard } from '../../../core/guards/roles.guard';
  import { Roles } from '../../../shared/decorators/roles.decorator';
  import { multerConfig } from '../../../core/config/multer.config';
  import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { AdminProductService } from '../services/admin-product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Express } from 'express';
  
@ApiTags('Admin - Products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/products')
export class AdminProductController {
  constructor(private readonly adminProductService: AdminProductService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Days Gone By' },
        price: { type: 'number', example: 59000 },
        description: { type: 'string', example: 'Famous work of Uzbek literature' },
        image: {
          type: 'string',
          format: 'binary',
        },
        categoryIds: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['category-uuid-1', 'category-uuid-2']
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adminProductService.createProduct(createProductDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products' })
  async getAllProducts(@Query() paginationDto: PaginationDto) {
    return this.adminProductService.getAllProducts(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminProductService.getProduct(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product information' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Days Gone By (updated)' },
        price: { type: 'number', example: 65000 },
        description: { type: 'string', example: 'Updated description' },
        image: {
          type: 'string',
          format: 'binary',
        },
        categoryIds: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['category-uuid-1', 'category-uuid-2']
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adminProductService.updateProduct(id, updateProductDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminProductService.deleteProduct(id);
  }
}