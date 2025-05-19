import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dto/user-response.dto';
import { PaginationDto } from '../../../shared/dtos/pagination.dto';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully', 
    type: UserResponseDto 
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all users', 
    type: [UserResponseDto] 
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the current user', 
    type: UserResponseDto 
  })
  getProfile(@CurrentUser() user) {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the user', 
    type: UserResponseDto 
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully', 
    type: UserResponseDto 
  })
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser
  ) {
    if (id !== currentUser.id && currentUser.role !== 'ADMIN') {
      id = currentUser.id;
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted successfully', 
    type: UserResponseDto 
  })
  remove(@Param('id') id: string, @CurrentUser() currentUser) {
    if (id !== currentUser.id && currentUser.role !== 'ADMIN') {
      id = currentUser.id;
    }
    return this.usersService.remove(id);
  }
}
