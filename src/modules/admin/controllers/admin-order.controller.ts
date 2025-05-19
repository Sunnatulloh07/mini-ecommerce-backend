import { 
  Controller, 
  Get, 
  Put, 
  Param, 
  Body, 
  UseGuards, 
  Query, 
  ParseUUIDPipe, 
  Delete 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { OrderFilterDto } from '../dto/order-filter.dto';

import { AdminOrderService } from '../services/admin-order.service';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';

@ApiTags('Admin - Orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin/orders')
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async getAllOrders(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: OrderFilterDto
  ) {
    return this.adminOrderService.getAllOrders(paginationDto, filterDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiResponse({ status: 200, description: 'Order statistics' })
  async getOrderStatistics() {
    return this.adminOrderService.getOrderStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminOrderService.getOrder(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto
  ) {
    return this.adminOrderService.updateOrderStatus(id, updateOrderStatusDto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order (soft delete)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async deleteOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminOrderService.deleteOrder(id);
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Get all orders for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserOrders(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.adminOrderService.getUserOrders(userId, paginationDto);
  }

  @Get('by-product/:productId')
  @ApiOperation({ summary: 'Get orders containing a specific product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getOrdersByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.adminOrderService.getOrdersByProduct(productId, paginationDto);
  }

  @Get('daily-report')
  @ApiOperation({ summary: 'Get daily orders report' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default: 30)' })
  @ApiResponse({ status: 200, description: 'Daily orders report' })
  async getDailyOrdersReport(@Query('days') days: number = 30) {
    return this.adminOrderService.getDailyOrdersReport(+days);
  }
}
