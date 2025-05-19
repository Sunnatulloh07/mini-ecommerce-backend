import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { AdminProductController } from './controllers/admin-product.controller';
import { AdminProductService } from './services/admin-product.service';
import { AdminCategoryController } from './controllers/admin-category.controller';
import { AdminCategoryService } from './services/admin-category.service';
import { AdminPaymentController } from './controllers/admin-payment.controller';
import { AdminPaymentService } from './services/admin-payment.service';
import { AdminOrderController } from './controllers/admin-order.controller';
import { AdminOrderService } from './services/admin-order.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { FileUploadService } from '../../shared/services/file-upload.service';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [
    AdminController, 
    AdminProductController,
    AdminCategoryController,
    AdminPaymentController,
    AdminOrderController
  ],
  providers: [
    AdminService, 
    AdminProductService,
    AdminCategoryService,
    AdminPaymentService,
    AdminOrderService,
    PrismaService, 
    FileUploadService
  ],
  exports: [
    AdminService, 
    AdminProductService,
    AdminCategoryService,
    AdminPaymentService,
    AdminOrderService
  ]
})
export class AdminModule {}