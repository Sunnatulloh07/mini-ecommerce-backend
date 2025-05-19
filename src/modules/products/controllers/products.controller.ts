import { Controller, Get, Param, Query, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../../shared/decorators/public.decorator';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductFilterDto } from '../dto/product-filter.dto';

@ApiTags('Products')
@Controller('products')
@Public()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products', type: [ProductResponseDto] })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Page size', required: false, type: Number })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query() filterDto: ProductFilterDto
  ) {
    const filter = new ProductFilterDto();
    Object.assign(filter, filterDto);
    
    return this.productsService.findAll({ page, limit }, filter);
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiResponse({ status: 200, description: 'Products belonging to category', type: [ProductResponseDto] })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async findByCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.productsService.findByCategory(id, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product' })
  @ApiResponse({ status: 200, description: 'Product details', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }
} 