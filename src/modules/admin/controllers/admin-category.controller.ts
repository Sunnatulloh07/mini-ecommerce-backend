import { 
    Controller, 
    Post, 
    Body, 
    UseGuards, 
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
    ApiParam,
    ApiBody,
    ApiQuery
  } from '@nestjs/swagger';
  import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
  import { RolesGuard } from '../../../core/guards/roles.guard';
  import { Roles } from '../../../shared/decorators/roles.decorator';
  import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { AdminCategoryService } from '../services/admin-category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
  
@ApiTags('Admin - Categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/categories')
export class AdminCategoryController {
  constructor(private readonly adminCategoryService: AdminCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.adminCategoryService.createCategory(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  async getAllCategories(@Query() paginationDto: PaginationDto) {
    return this.adminCategoryService.getAllCategories(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID', type: String })
  @ApiResponse({ status: 200, description: 'Category details' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminCategoryService.getCategory(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID', type: String })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.adminCategoryService.updateCategory(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID', type: String })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminCategoryService.deleteCategory(id);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiParam({ name: 'id', description: 'Category ID', type: String })
  @ApiResponse({ status: 200, description: 'List of products' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  async getCategoryProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.adminCategoryService.getCategoryProducts(id, paginationDto);
  }
}