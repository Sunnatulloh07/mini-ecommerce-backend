import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsIn } from 'class-validator';

export class UpdatePaymentStatusDto {
  @ApiProperty({
    description: 'Payment status',
    example: 'SUCCESS',
    enum: ['PENDING', 'SUCCESS', 'FAILED']
  })
  @IsNotEmpty()
  @IsIn(['PENDING', 'SUCCESS', 'FAILED'])
  status: string;
}