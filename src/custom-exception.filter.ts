import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const statusCode = exception.getStatus();
    const res = exception.getResponse() as { message: string[] };

    response
      .json({
        code: statusCode,
        message: 'fail',
        data: Array.isArray(res?.message)
          ? res?.message?.join('、')
          : exception.message,
        success: false,
      })
      .end();
  }
}
