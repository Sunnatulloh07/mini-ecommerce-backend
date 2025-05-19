# E-commerce API

This is a NestJS-based e-commerce API that provides functionality for managing products, categories, orders, and payments.

## Features

- User authentication and authorization (JWT-based)
- Product management with categories
- Order processing
- Payment integration
- Role-based access control (Admin/User)

## Tech Stack

- NestJS
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Swagger/OpenAPI

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Yarn or npm

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce?schema=public"

# JWT
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRATION="24h"

# Server
PORT=4000
NODE_ENV=development
API_PREFIX=api
API_VERSION=v1
CORS_ENABLED=true
FRONTEND_URL=http://localhost:3000

# JWT security config
JWT_SECRET=
JWT_ACCESS_EXPIRATION=
JWT_REFRESH_EXPIRATION=

# Swagger docs
SWAGGER_TITLE=
SWAGGER_DESCRIPTION=
SWAGGER_VERSION=
SWAGGER_PATH=
SWAGGER_ENABLED=

#  ADMIN 
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=

# File Upload
UPLOAD_DIR="uploads"
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd test-ecommerce
```

2. Install dependencies:
```bash
yarn install
```

3. Set up the database:
```bash
yarn prisma generate
yarn prisma migrate dev
```

4. Start the development server:
```bash
yarn start:dev
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

## Project Structure

```
src/
├── core/           # Core functionality (auth, guards, etc.)
├── modules/        # Feature modules
│   ├── users/     # User management
│   ├── products/  # Product management
│   ├── orders/    # Order processing
│   └── payments/  # Payment handling
└── shared/        # Shared utilities and common code
```

## Database Schema

The project uses Prisma with the following main models:
- User
- Product
- Category
- Order
- OrderItem
- Payment

## Available Scripts

- `yarn start:dev` - Start development server
- `yarn build` - Build the project
- `yarn start:prod` - Start production server
- `yarn test` - Run tests
- `yarn prisma generate` - Generate Prisma client
- `yarn prisma migrate dev` - Run database migrations

## License

This project is private and unlicensed.
