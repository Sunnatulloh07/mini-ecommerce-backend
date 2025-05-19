import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class BlockUserDto {
  @ApiProperty({
    description: 'User active status',
    example: false,
    type: Boolean
  })
  @IsBoolean()
  isActive: boolean;
}