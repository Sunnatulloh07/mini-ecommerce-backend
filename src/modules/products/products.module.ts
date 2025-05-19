import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService],
  exports: [ProductsService]
})
export class ProductsModule {}
