import * as crypto from 'crypto';
import { BadRequestException, ParseIntPipe } from '@nestjs/common';

export const md5 = (str: string) => {
  const hash = crypto.createHash('md5');
  return hash.update(str).digest('hex');
};

export const generateParseIntPipe = (name: string) => {
  return new ParseIntPipe({
    exceptionFactory: () => {
      throw new BadRequestException(`${name}必须为数字`);
    },
  });
};
