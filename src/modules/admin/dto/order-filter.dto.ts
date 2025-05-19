import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, IsDateString, IsUUID } from 'class-validator';
import { OrderStatusEnum } from '../../../shared/constants/order-status.constant';

export class OrderFilterDto {
  @ApiProperty({
    description: 'Filter by order status',
    required: false,
    enum: OrderStatusEnum
  })
  @IsOptional()
  @IsIn(Object.values(OrderStatusEnum))
  status?: string;

  @ApiProperty({
    description: 'Orders start date (YYYY-MM-DD)',
    required: false,
    example: '2023-01-01'
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({
    description: 'Orders end date (YYYY-MM-DD)',
    required: false,
    example: '2023-12-31'
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({
    description: 'Filter by user ID',
    required: false,
    example: 'user-uuid'
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
