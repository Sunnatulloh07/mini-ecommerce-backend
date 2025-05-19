import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  /**
   * Uploads file to server storage with unique name
   * @param file - File to upload
   * @param folder - Target folder (default: 'products')
   * @returns URL path to the uploaded file
   */
  uploadFile(file: Express.Multer.File, folder: string = 'products'): string {
    if (!file) {
      throw new BadRequestException('File not found');
    }

    const uploadFolder = join(process.cwd(), 'uploads', folder);
    
    if (!existsSync(uploadFolder)) {
      mkdirSync(uploadFolder, { recursive: true });
    }

    const fileExt = extname(file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = join(folder, fileName);
    
    const fullPath = join(uploadFolder, fileName);
    const fs = require('fs');
    fs.writeFileSync(fullPath, file.buffer);

    return `/uploads/${filePath}`;
  }
}