import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Fiction',
    maxLength: 50
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'All types of fiction books',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}