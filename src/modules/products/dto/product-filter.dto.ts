import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsUUID, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProductFilterDto {
  @ApiProperty({
    description: 'Search by book title',
    required: false,
    example: 'Harry Potter'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by category ID',
    required: false,
    example: 'category-uuid'
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Minimum price',
    required: false,
    example: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price',
    required: false,
    example: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  })
  maxPrice?: number;
  
  @ApiProperty({
    description: 'Sort field',
    required: false,
    enum: ['price', 'title', 'createdAt'],
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  @IsIn(['price', 'title', 'createdAt'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
} 