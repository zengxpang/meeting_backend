import { ApiProperty } from '@nestjs/swagger';

export class QrcodeGenerateVo {
  @ApiProperty()
  qrcodeId: string;

  @ApiProperty()
  image: string;
}
