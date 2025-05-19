import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  Query, 
  UseGuards, 
  ParseUUIDPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createOrderDto: CreateOrderDto
  ) {
    return this.ordersService.create(userId, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the current user' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.ordersService.findAll(userId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({ name: 'id', description: 'Order ID', type: String })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.ordersService.findOne(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({ name: 'id', description: 'Order ID', type: String })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.ordersService.cancel(id, userId);
  }
}
