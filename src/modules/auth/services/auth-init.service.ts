import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthInitService implements OnModuleInit {
  private readonly logger = new Logger(AuthInitService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createAdminIfNotExists();
  }

  /**
   * Creates an admin user if it doesn't exist
   */
  private async createAdminIfNotExists() {
    const adminData = {
      email: this.configService.get('ADMIN_EMAIL') || 'admin@example.com',
      password: this.configService.get('ADMIN_PASSWORD') || 'Admin123',
      name: this.configService.get('ADMIN_NAME') || 'Admin',
      role: Role.ADMIN,
    };

    const adminExists = await this.prismaService.user.findUnique({
      where: { email: adminData.email },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      await this.prismaService.user.create({
        data: {
          email: adminData.email,
          password: hashedPassword,
          name: adminData.name,
          role: adminData.role,
        },
      });

      this.logger.log('Admin user created successfully');
    }
  }
}
