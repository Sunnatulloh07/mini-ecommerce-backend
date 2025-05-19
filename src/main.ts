import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS for API access
  app.enableCors();
  
  // Set up static file serving for uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Enable validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Set up Swagger documentation using configuration
  const swaggerConfig = configService.get('swagger');
  const config = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerConfig.path, app, document);
  
  // Start the server
  const port = configService.get('app.port', 3000);
  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
bootstrap();
