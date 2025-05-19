import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { SharedModule } from '../../shared/shared.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SharedModule, ConfigModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService],
  exports: [PaymentsService]
})
export class PaymentsModule {}
