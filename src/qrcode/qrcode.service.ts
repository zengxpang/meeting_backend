import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as qrcode from 'qrcode';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';
import { LoginUserVo } from '../user/vo/login-user.vo';

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

  @Inject(UserService)
  private readonly userService: UserService;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  async generate() {
    const uuid = randomUUID();
    const dataUrl = await qrcode.toDataURL(
      `http://192.168.2.37:8000/loginConfirm?qrcodeId=${uuid}`,
    );

    await this.redisService.setHashField(`qrcode_${uuid}`, 'status', 'no-scan');

    return {
      qrcodeId: uuid,
      image: dataUrl,
    };
  }

  async check(qrcodeId: string) {
    const qrcodeInfo = await this.redisService.getAllHashFields(
      `qrcode_${qrcodeId}`,
    );

    const status = qrcodeInfo.status;
    if (status === 'scan-confirm' && qrcodeInfo.userInfo) {
      const userInfo = JSON.parse(qrcodeInfo.userInfo);
      return {
        status,
        data: this.userService.setToken({
          userInfo,
        } as LoginUserVo),
      };
    }
    return qrcodeInfo;
  }

  async confirm(qrcodeId: string, auth: string) {
    let user;
    try {
      const theAuth = auth.split(' ')[1];
      const userInfo = this.jwtService.verify(theAuth);
      user = await this.userRepository.findOneBy({
        id: userInfo.userId,
      });
    } catch (e) {
      throw new BadRequestException('token已过期，请重新登陆');
    }

    await this.redisService.setHashField(
      `qrcode_${qrcodeId}`,
      'status',
      'scan-confirm',
    );

    await this.redisService.setHashField(
      `qrcode_${qrcodeId}`,
      'userInfo',
      JSON.stringify(user),
    );
    return 'success';
  }

  async cancel(qrcodeId: string) {
    const status = await this.redisService.getHashField(
      `qrcode_${qrcodeId}`,
      'status',
    );
    if (!status) {
      throw new BadRequestException('二维码已过期');
    }
    await this.redisService.setHashField(
      `qrcode_${qrcodeId}`,
      'status',
      'scan-cancel',
    );
    return 'success';
  }

  async scan(qrcodeId: string) {
    const status = await this.redisService.getHashField(
      `qrcode_${qrcodeId}`,
      'status',
    );
    if (!status) {
      throw new BadRequestException('二维码已过期');
    }
    await this.redisService.setHashField(
      `qrcode_${qrcodeId}`,
      'status',
      'scan-wait-confirm',
    );
    return 'success';
  }
}
