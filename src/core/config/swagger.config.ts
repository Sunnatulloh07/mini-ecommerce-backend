import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  title: 'E-commerce API',
  description: 'API for e-commerce bookstore',
  version: '1.0',
  path: 'api/docs',
}));