import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, IsDateString } from 'class-validator';

export class PaymentQueryDto {
  @ApiProperty({
    description: 'Filter by payment status',
    required: false,
    enum: ['PENDING', 'SUCCESS', 'FAILED']
  })
  @IsOptional()
  @IsIn(['PENDING', 'SUCCESS', 'FAILED'])
  status?: string;

  @ApiProperty({
    description: 'Payments start date (YYYY-MM-DD)',
    required: false,
    example: '2023-01-01'
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({
    description: 'Payments end date (YYYY-MM-DD)',
    required: false,
    example: '2023-12-31'
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}