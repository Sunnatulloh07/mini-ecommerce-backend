import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Order items',
    type: [OrderItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
