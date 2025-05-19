import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  /**
   * Connects to database when module initializes
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Disconnects from database when module is destroyed
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
