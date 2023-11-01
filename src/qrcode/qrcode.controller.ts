import { Controller, Get, Headers, Inject, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { QrcodeService } from './qrcode.service';

@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Get('generate')
  async generate() {
    return await this.qrcodeService.generate();
  }

  @Get('check')
  async check(@Query('qrcodeId') qrcodeId: string) {
    return await this.qrcodeService.check(qrcodeId);
  }

  @Get('confirm')
  async confirm(
    @Query('qrcodeId') qrcodeId: string,
    @Headers('Authorization') auth: string,
  ) {
    return await this.qrcodeService.confirm(qrcodeId, auth);
  }

  @Get('cancel')
  async cancel(@Query('qrcodeId') qrcodeId: string) {
    return await this.qrcodeService.cancel(qrcodeId);
  }

  @Get('scan')
  async scan(@Query('qrcodeId') qrcodeId: string) {
    return await this.qrcodeService.scan(qrcodeId);
  }
}
