import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    Logger,
  } from '@nestjs/common';
  import { Response } from 'express';
  
  @Catch(HttpException)
  export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);
  
    /**
     * Handles and formats standard HTTP exceptions
     * @param exception - The caught HttpException
     * @param host - Arguments host for context switching
     * @returns Standardized error response with logging
     */
    catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();
  
      const error = {
        statusCode: status,
        message: typeof errorResponse === 'string' ? errorResponse : 
                (errorResponse as any).message || 'Error occurred',
      };
  
      this.logger.error(`${request.method} ${request.url}`);
  
      response.status(status).json(error);
    }
  }