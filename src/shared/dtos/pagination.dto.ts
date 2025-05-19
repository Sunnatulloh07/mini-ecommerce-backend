import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({ 
    description: 'Page number', 
    default: 1, 
    required: false 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Items per page', 
    default: 10, 
    required: false 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
