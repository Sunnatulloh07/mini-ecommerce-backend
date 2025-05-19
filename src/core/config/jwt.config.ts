import { registerAs } from '@nestjs/config';

// JWT authentication configuration
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'super-secret',
  accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
}));