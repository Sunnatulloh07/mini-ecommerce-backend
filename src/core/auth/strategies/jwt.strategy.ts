import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret') as string,
    });
  }

  /**
   * Validates JWT payload and returns user data
   * @param payload - JWT payload with user information
   * @returns User object if valid, null otherwise
   */
  async validate(payload: any) {
    const user = await this.prismaService.user.findUnique({
      where: { 
        id: payload.sub, 
        isActive: true,
        isDeleted: false
      },
    });

    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}