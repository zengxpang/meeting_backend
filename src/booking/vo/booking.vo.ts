import { ApiProperty } from '@nestjs/swagger';
import { MeetingRoomVo } from '../../meeting-room/vo/meeting-room.vo';
import { UserInfo } from '../../user/vo/login-user.vo';

export class BookingVo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  user: UserInfo;

  @ApiProperty()
  room: MeetingRoomVo;

  @ApiProperty()
  createTime: Date;

  @ApiProperty()
  updateTime: Date;
}
