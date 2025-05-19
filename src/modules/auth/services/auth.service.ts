import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException,
  ConflictException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Role } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers a new user, hashes password, and generates authentication tokens
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.USER,
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  /**
   * Authenticates a user with email and password, returns user data with tokens
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is blocked');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  /**
   * Retrieves a user's profile with their order history
   */
  async getUserProfile(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        orders: {
          where: { isDeleted: false },
          select: {
            id: true,
            totalPrice: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  /**
   * Refreshes authentication tokens for a valid user
   */
  async refreshToken(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId, isActive: true, isDeleted: false },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or blocked');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  /**
   * Generates JWT access and refresh tokens with appropriate expiration times
   */
  private generateTokens(userId: string, email: string, role: Role) {
    const payload = { 
      sub: userId,
      email,
      role
    };

    const accessTokenExpiration = this.configService.get<string>('jwt.accessTokenExpiration', '15m');
    const refreshTokenExpiration = this.configService.get<string>('jwt.refreshTokenExpiration', '7d');

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: accessTokenExpiration }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: refreshTokenExpiration }),
      expires_in: this.getExpirationTime(accessTokenExpiration),
    };
  }

  /**
   * Converts JWT expiration string format to seconds
   */
  private getExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/(\d+)([smhd])/);
    if (!match) return 900; // default 15m

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900;
    }
  }
}