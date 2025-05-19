import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Updated category name',
    maxLength: 50
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Updated category description',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}