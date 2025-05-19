import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
  
  @Catch(PrismaClientKnownRequestError)
  export class PrismaExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PrismaExceptionFilter.name);
  
    /**
     * Converts Prisma database errors to appropriate HTTP responses
     * @param exception - The caught Prisma error
     * @param host - Arguments host for context switching
     * @returns Mapped error response based on Prisma error code
     */
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Database error';
  
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Duplicate entry';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } 
  
      this.logger.error(`${request.method} ${request.url}`);
  
      response.status(status).json({
        statusCode: status,
        message,
      });
    }
  }