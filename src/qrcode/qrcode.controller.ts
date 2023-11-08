import {
  Controller,
  Get,
  Headers,
  HttpStatus,
  Inject,
  Query,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QrcodeService } from './qrcode.service';
import { QrcodeGenerateVo } from './vo/qrcode-generate.vo';
import { QrcodeCheckVo } from './vo/qrcode-check.vo';

@ApiTags('二维码登录模块')
@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: QrcodeGenerateVo,
  })
  @Get('generate')
  async generate() {
    return await this.qrcodeService.generate();
  }

  @ApiQuery({
    name: 'qrcodeId',
    type: String,
    description: '二维码ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '检查成功',
    type: QrcodeCheckVo,
  })
  @Get('check')
  async check(@Query('qrcodeId') qrcodeId: string) {
    return await this.qrcodeService.check(qrcodeId);
  }

  @ApiQuery({
    name: 'qrcodeId',
    type: String,
    description: '二维码ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '确认成功',
    type: String,
  })
  @Get('confirm')
  async confirm(
    @Query('qrcodeId') qrcodeId: string,
    @Headers('Authorization') auth: string,
  ) {
    return await this.qrcodeService.confirm(qrcodeId, auth);
  }

  @ApiQuery({
    name: 'qrcodeId',
    type: String,
    description: '二维码ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '取消成功',
    type: String,
  })
  @Get('cancel')
  async cancel(@Query('qrcodeId') qrcodeId: string) {
    return await this.qrcodeService.cancel(qrcodeId);
  }

  @ApiQuery({
    name: 'qrcodeId',
    type: String,
    description: '二维码ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '扫码成功',
    type: String,
  })
  @Get('scan')
  async scan(@Query('qrcodeId') qrcodeId: string) {
    return await this.qrcodeService.scan(qrcodeId);
  }
}
