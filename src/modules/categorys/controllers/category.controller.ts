import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { Public } from '../../../shared/decorators/public.decorator';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of all categories' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get category details' })
  @ApiResponse({ status: 200, description: 'Category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category ID', type: String })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }
}
