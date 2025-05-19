import { Module } from '@nestjs/common';
import { OrderUtilsService } from './services/order-utils.service';
import { PrismaService } from '../core/prisma/prisma.service';
import { FileUploadService } from './services/file-upload.service';

@Module({
  providers: [OrderUtilsService, PrismaService, FileUploadService],
  exports: [OrderUtilsService, FileUploadService, PrismaService]
})
export class SharedModule {} 