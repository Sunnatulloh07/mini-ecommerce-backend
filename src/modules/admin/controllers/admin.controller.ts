import { 
    Controller, 
    Get, 
    Put, 
    Param, 
    UseGuards, 
    Query, 
    ParseUUIDPipe, 
    Body
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
  import { AdminService } from '../services/admin.service';
  import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
  import { Roles } from '../../../shared/decorators/roles.decorator';
  import { RolesGuard } from '../../../core/guards/roles.guard';
  import { PaginationDto } from '../../../shared/dtos/pagination.dto';
  import { BlockUserDto } from '../dto/block-user.dto';
  
  @ApiTags('Admin Management')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Controller('admin')
  export class AdminController {
    constructor(private readonly adminService: AdminService) {}
  
    @Get('statistics')
    @ApiOperation({ summary: 'Get system statistics' })
    @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async getStatistics() {
      return this.adminService.getStatistics();
    }
  
    @Get('users')
    @ApiOperation({ summary: 'Get all users' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiResponse({ status: 200, description: 'List of users' })
    async getUsers(@Query() paginationDto: PaginationDto) {
      return this.adminService.getUsers(paginationDto);
    }
  
    @Put('users/:id/block')
    @ApiOperation({ summary: 'Block/unblock a user' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User status changed successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async blockUser(
      @Param('id', ParseUUIDPipe) id: string, 
      @Body() blockUserDto: BlockUserDto
    ) {
      return this.adminService.toggleUserBlock(id, blockUserDto.isActive);
    }
  
    @Get('orders')
    @ApiOperation({ summary: 'View all orders' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiResponse({ status: 200, description: 'List of orders' })
    async getOrders(@Query() paginationDto: PaginationDto) {
      return this.adminService.getOrders(paginationDto);
    }
  
    @Get('products')
    @ApiOperation({ summary: 'View all products' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
    @ApiResponse({ status: 200, description: 'List of products' })
    async getProducts(@Query() paginationDto: PaginationDto) {
      return this.adminService.getProducts(paginationDto);
    }
  }