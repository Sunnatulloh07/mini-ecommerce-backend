import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
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
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe'
  })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;
}