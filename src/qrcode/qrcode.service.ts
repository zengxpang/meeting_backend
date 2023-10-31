import { Injectable } from '@nestjs/common';
import { CreateQrcodeDto } from './dto/create-qrcode.dto';
import { UpdateQrcodeDto } from './dto/update-qrcode.dto';
import { randomUUID } from 'crypto';
import * as qrcode from 'qrcode';

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
  async generate() {
    const uuid = randomUUID();
    const dataUrl = await qrcode.toDataURL(uuid);

    // 存在 redis
    return {
      qrcodeId: uuid,
      image: dataUrl,
    };
  }

  async check(qrcodeId: string) {
    // redis 中取出
    // const info: IQrCodeInfo =
  }
}
