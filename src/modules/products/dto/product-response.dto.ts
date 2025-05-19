import { ApiProperty } from '@nestjs/swagger';

class CategoryDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'category-uuid'
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Fiction'
  })
  name: string;
}

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'product-uuid'
  })
  id: string;

  @ApiProperty({
    description: 'Book title',
    example: 'Clean Code'
  })
  title: string;

  @ApiProperty({
    description: 'Book price',
    example: 29.99
  })
  price: number;

  @ApiProperty({
    description: 'Book image URL',
    example: '/uploads/products/book-image.jpg'
  })
  image: string;

  @ApiProperty({
    description: 'Book description',
    example: 'A handbook of agile software craftsmanship'
  })
  description: string;

  @ApiProperty({
    description: 'Book categories',
    type: [CategoryDto]
  })
  categories: CategoryDto[];
} 