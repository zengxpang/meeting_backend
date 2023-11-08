import { ApiProperty } from '@nestjs/swagger';
import { LoginUserVo } from '../../user/vo/login-user.vo';

enum QrcodeStatus {
  'no-scan' = 'no-scan',
  'scan-wait-confirm' = 'scan-wait-confirm',
  'scan-confirm' = 'scan-confirm',
  'scan-cancel' = 'scan-cancel',
  'expired' = 'expired',
}

export class QrcodeCheckVo {
  @ApiProperty({
    enum: QrcodeStatus,
  })
  status: QrcodeStatus;

  @ApiProperty({
    type: LoginUserVo,
  })
  data?: LoginUserVo;
}
