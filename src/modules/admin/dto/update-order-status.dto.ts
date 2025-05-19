import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIn } from 'class-validator';
import { OrderStatusEnum } from '../../../shared/constants/order-status.constant';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'Order status',
    example: 'PAID',
    enum: OrderStatusEnum
  })
  @IsNotEmpty()
  @IsIn(Object.values(OrderStatusEnum))
  status: string;
}
