import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as qrcode from 'qrcode';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';
import { RedisService } from '../redis/redis.service';

// no-scan 未扫描
// scan-wait-confirm -已扫描，等待用户确认
// scan-confirm 已扫描，用户同意授权
// scan-cancel 已扫描，用户取消授权
// expired 已过期
interface IQrCodeInfo {
  status:
    | 'no-scan'
    | 'scan-wait-confirm'
    | 'scan-confirm'
    | 'scan-cancel'
    | 'expired';
  userInfo?: {
    userId: number;
  };
}

@Injectable()
export class QrcodeService {
  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  async generate() {
    const uuid = randomUUID();
    const dataUrl = await qrcode.toDataURL(uuid);

    await this.redisService.hSet(`qrcode_${uuid}`, {
      status: 'no-scan',
    });

    return {
      qrcodeId: uuid,
      image: dataUrl,
    };
  }

  async check(qrcodeId: string) {
    const info = await this.redisService.hGetAll(`qrcode_${qrcodeId}`);
    if (info.status === 'scan-confirm') {
      return {
        token: this.jwtService.sign({
          userId: info.userInfo.userId,
        }),
        ...info,
      };
    }
    console.log('info', info);
    return info;
  }

  async confirm(qrcodeId: string, auth: string) {
    let user;
    try {
      const userInfo = this.jwtService.verify(auth);
      user = this.userRepository.findOneBy({
        id: userInfo.userId,
      });
    } catch (e) {
      throw new BadRequestException('token已过期，请重新登陆');
    }
    const info = await this.redisService.hGetAll(`qrcode_${qrcodeId}`);
    info.userInfo = user;
    await this.redisService.hSet(`qrcode_${qrcodeId}`, info);
    return 'success';
  }

  async cancel(qrcodeId: string) {
    const info = await this.redisService.hGetAll(`qrcode_${qrcodeId}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }
    info.status = 'scan-cancel';
    await this.redisService.hSet(`qrcode_${qrcodeId}`, info);
    return 'success';
  }

  async scan(qrcodeId: string) {
    const info = await this.redisService.hGetAll(`qrcode_${qrcodeId}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }
    info.status = 'scan-wait-confirm';
    await this.redisService.hSet(`qrcode_${qrcodeId}`, info);
    return 'success';
  }
}
