import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Product title', example: 'Days Gone By' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Product price', example: 59000 })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({ description: 'Product description', example: 'Famous work of Uzbek literature' })
  @IsNotEmpty()
  @IsString()
  description: string;

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
    // Convert comma-separated values to array if string
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  categoryIds?: string[];
}