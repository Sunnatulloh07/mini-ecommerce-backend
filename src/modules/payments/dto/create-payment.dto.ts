import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsNumber, IsString, Min, Matches } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Order ID',
    example: 'uuid-string'
  })
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @ApiProperty({
    description: 'Card number (must be 16 digits, with or without spaces)',
    example: '4111 1111 1111 1111'
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[\d\s]+$/, { message: 'Card number must contain only digits and spaces' })
  cardNumber: string;

  @ApiProperty({
    description: 'CVV code',
    example: '123'
  })
  @IsNotEmpty()
  cvv: string;

  @ApiProperty({
    description: 'Card expiry date',
    example: '12/25'
  })
  @IsNotEmpty()
  expiryDate: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 100000
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    example: 'CARD',
    default: 'CARD'
  })
  @IsNotEmpty()
  paymentMethod: string = 'CARD';
} 