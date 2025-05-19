import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com'
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123'
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}