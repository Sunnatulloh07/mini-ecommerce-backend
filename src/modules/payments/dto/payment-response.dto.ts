import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: 'uuid-string'
  })
  id: string;

  @ApiProperty({
    description: 'Order ID',
    example: 'uuid-string'
  })
  orderId: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 100000
  })
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    example: 'CARD'
  })
  paymentMethod: string;

  @ApiProperty({
    description: 'Transaction ID',
    example: 'trx123456',
    nullable: true
  })
  transactionId: string | null;

  @ApiProperty({
    description: 'Payment status',
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    example: 'SUCCESS'
  })
  status: string;

  @ApiProperty({
    description: 'Payment created date',
    example: '2023-12-01T12:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Payment updated date',
    example: '2023-12-01T12:05:00Z'
  })
  updatedAt: Date;
} 