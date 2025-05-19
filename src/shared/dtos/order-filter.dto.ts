import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';
import { OrderStatusEnum } from '../constants/order-status.constant';

export class OrderFilterDto {
  @ApiProperty({
    description: 'Filter by order status',
    required: false,
    enum: OrderStatusEnum
  })
  @IsOptional()
  @IsIn(Object.values(OrderStatusEnum))
  status?: string;
} 