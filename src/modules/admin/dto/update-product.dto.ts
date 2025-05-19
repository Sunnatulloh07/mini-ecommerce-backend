import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @ApiProperty({ description: 'Product title', example: 'Days Gone By (updated)', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Product price', example: 65000, required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  price?: number;

  @ApiProperty({ description: 'Product description', example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Category IDs',
    type: [String],
    required: false,
    example: ['category-uuid-1', 'category-uuid-2'] 
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  categoryIds?: string[];
}