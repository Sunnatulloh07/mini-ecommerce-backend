import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import * as multer from 'multer';

export const multerConfig: MulterOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, callback) => {
    callback(null, true);
  },
  storage: multer.memoryStorage()
};