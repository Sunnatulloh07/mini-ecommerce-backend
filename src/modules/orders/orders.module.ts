import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  exports: [OrdersService]
})
export class OrdersModule {}
