import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'generated/prisma';

export class UserResponseDto {
  @ApiProperty({ 
    description: 'User ID' 
  })
  id: string;

  @ApiProperty({ 
    description: 'User email' 
  })
  email: string;

  @ApiProperty({ 
    description: 'User name' 
  })
  name: string;

  @ApiProperty({ 
    description: 'User role',
    enum: Role,
    example: 'USER'
  })
  role: Role;

  @ApiProperty({ 
    description: 'User active status' 
  })
  isActive: boolean;

  @ApiProperty({ 
    description: 'User creation date' 
  })
  createdAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
} 