import { ApiProperty } from '@nestjs/swagger';

class PaymentInfo {
  @ApiProperty({
    description: 'Payment ID',
    example: 'uuid-string'
  })
  id: string;

  @ApiProperty({
    description: 'Payment status',
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    example: 'SUCCESS'
  })
  status: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 100000
  })
  amount: number;

  @ApiProperty({
    description: 'Transaction ID',
    example: 'trx123456'
  })
  transactionId: string;
}

export class PaymentResultDto {
  @ApiProperty({
    description: 'Was the payment successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Payment details',
    type: PaymentInfo
  })
  payment: PaymentInfo;

  @ApiProperty({
    description: 'Payment message',
    example: 'Payment processed successfully',
    required: false
  })
  message?: string;
} 