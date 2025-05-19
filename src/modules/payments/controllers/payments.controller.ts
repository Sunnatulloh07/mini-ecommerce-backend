import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentResultDto } from '../dto/payment-result.dto';
import { PaymentResponseDto } from '../dto/payment-response.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process a payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully', type: PaymentResultDto })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async processPayment(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentResultDto> {
    return this.paymentsService.processPayment(createPaymentDto);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details for an order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Payment details', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Payment details not found' })
  async getPaymentByOrderId(@Param('orderId') orderId: string): Promise<PaymentResponseDto> {
    return this.paymentsService.getPaymentByOrderId(orderId);
  }
}
