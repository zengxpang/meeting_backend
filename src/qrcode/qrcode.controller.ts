import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
} from '@nestjs/common';
import { QrcodeService } from './qrcode.service';
import { CreateQrcodeDto } from './dto/create-qrcode.dto';
import { UpdateQrcodeDto } from './dto/update-qrcode.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('qrcode')
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}
  @Inject(JwtService)
  private jwtService: JwtService;

  @Get('generate')
  async generate() {
    await this.qrcodeService.generate();
  }

  @Get('check')
  async check(@Query('qrcodeId') qrcodeId: string) {
    await this.qrcodeService.check(qrcodeId);
  }
}
