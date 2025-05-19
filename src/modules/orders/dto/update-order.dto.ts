import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatusEnum } from 'src/shared/constants/order-status.constant';



export class UpdateOrderDto {
  @ApiProperty({
    description: 'Order status',
    enum: OrderStatusEnum,
    example: 'CANCELLED'
  })
  @IsEnum(OrderStatusEnum)
  @IsOptional()
  status?: string;
}
