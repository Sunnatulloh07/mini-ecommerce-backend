import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { OrderStatusEnum } from 'src/shared/constants/order-status.constant';

export class OrderFilterDto {
  @ApiProperty({
    description: 'Filter by order status',
    enum: OrderStatusEnum,
    required: false
  })
  @IsEnum(OrderStatusEnum)
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Filter by date (from)',
    required: false,
    example: '2023-01-01'
  })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiProperty({
    description: 'Filter by date (to)',
    required: false,
    example: '2023-12-31'
  })
  @IsDateString()
  @IsOptional()
  dateTo?: string;
}