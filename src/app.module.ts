import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './core/exceptions/http-exception.filter';
import { PrismaExceptionFilter } from './core/exceptions/prisma-exception.filter';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { PrismaService } from './core/prisma/prisma.service';
import appConfig from './core/config/app.config';
import databaseConfig from './core/config/database.config';
import jwtConfig from './core/config/jwt.config';
import swaggerConfig from './core/config/swagger.config';
import { multerConfig } from './core/config/multer.config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AdminModule } from './modules/admin/admin.module';
import { CategoryModule } from './modules/categorys/categorys.module';
import { PaymentsModule } from './modules/payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, swaggerConfig],
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
    CategoryModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: 'MULTER_CONFIG',
      useValue: multerConfig,
    },
  ],
})
export class AppModule {}
