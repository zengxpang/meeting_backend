import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

export class UnLoginException {
  message: string;
  constructor(message?) {
    this.message = message;
  }
}

// catch 的参数指定catch的异常类型
@Catch(UnLoginException)
export class UnLoginFilter implements ExceptionFilter {
  catch(exception: UnLoginException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    response
      .json({
        code: HttpStatus.UNAUTHORIZED,
        message: 'fail',
        data: exception.message || '未登录',
      })
      .end();
  }
}
