import { 
    Controller, 
    Get, 
    Param, 
    UseGuards, 
    Query, 
    ParseUUIDPipe,
    Put,
    Body
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
  import { PaymentQueryDto } from '../dto/payment-query.dto';
  import { UpdatePaymentStatusDto } from '../dto/update-payment-status.dto';
  import { AdminPaymentService } from '../services/admin-payment.service';

  @ApiTags('Admin - Payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Controller('admin/payments')
  export class AdminPaymentController {
    constructor(private readonly adminPaymentService: AdminPaymentService) {}
  
    @Get()
    @ApiOperation({ summary: 'Get all payments' })
    @ApiResponse({ status: 200, description: 'List of payments' })
    async getAllPayments(
      @Query() paginationDto: PaginationDto,
      @Query() paymentQueryDto: PaymentQueryDto
    ) {
      return this.adminPaymentService.getAllPayments(paginationDto, paymentQueryDto);
    }
  
    @Get('statistics')
    @ApiOperation({ summary: 'Get payment statistics' })
    @ApiResponse({ status: 200, description: 'Payment statistics' })
    async getPaymentStatistics() {
      return this.adminPaymentService.getPaymentStatistics();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get payment by ID' })
    @ApiParam({ name: 'id', description: 'Payment ID' })
    @ApiResponse({ status: 200, description: 'Payment details' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    async getPayment(@Param('id', ParseUUIDPipe) id: string) {
      return this.adminPaymentService.getPayment(id);
    }
  
    @Put(':id/status')
    @ApiOperation({ summary: 'Update payment status' })
    @ApiParam({ name: 'id', description: 'Payment ID' })
    @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
    @ApiResponse({ status: 404, description: 'Payment not found' })
    async updatePaymentStatus(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updatePaymentStatusDto: UpdatePaymentStatusDto
    ) {
      return this.adminPaymentService.updatePaymentStatus(id, updatePaymentStatusDto.status);
    }
  
    @Get('by-user/:userId')
    @ApiOperation({ summary: 'Get payments by user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'List of payments' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getPaymentsByUser(
      @Param('userId', ParseUUIDPipe) userId: string,
      @Query() paginationDto: PaginationDto
    ) {
      return this.adminPaymentService.getPaymentsByUser(userId, paginationDto);
    }
  }