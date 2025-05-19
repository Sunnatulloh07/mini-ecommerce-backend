import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ 
    description: 'User email', 
    example: 'user@example.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    description: 'User name', 
    example: 'John Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    description: 'User password', 
    example: 'newpassword123',
    required: false,
    minLength: 6
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
} 