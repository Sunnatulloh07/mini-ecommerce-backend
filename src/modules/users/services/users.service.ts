import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new user
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const user = await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        role: Role.USER
      }
    });

    return this.buildUserResponse(user);
  }

  /**
   * Retrieves all users with pagination
   */
  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where: { isDeleted: false },
        skip,
        take: limit,
      }),
      this.prismaService.user.count({
        where: { isDeleted: false }
      })
    ]);

    const responseUsers = users.map(user => this.buildUserResponse(user));

    return {
      data: responseUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Retrieves a user by ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id, isDeleted: false }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.buildUserResponse(user);
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email, isDeleted: false }
    });
  }

  /**
   * Updates a user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id, isDeleted: false }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {};

    if (updateUserDto.email) {
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: updateUserDto.email }
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this email already exists');
      }

      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.name) {
      updateData.name = updateUserDto.name;
    }

    if (updateUserDto.password) {
      updateData.password = await this.hashPassword(updateUserDto.password);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: updateData
    });

    return this.buildUserResponse(updatedUser);
  }

  /**
   * Deletes a user
   */
  async remove(id: string): Promise<UserResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id, isDeleted: false }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.prismaService.user.update({
      where: { id },
      data: { isDeleted: true }
    });

    return this.buildUserResponse(deletedUser);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  private buildUserResponse(user: any): UserResponseDto {
    const { password, ...userWithoutPassword } = user;
    return new UserResponseDto(userWithoutPassword);
  }
}
