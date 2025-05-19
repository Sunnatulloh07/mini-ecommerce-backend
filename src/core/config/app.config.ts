import { registerAs } from '@nestjs/config';

// Application configuration
export default registerAs('app', () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
}));