import { IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMeetingRoomDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '会议室名称不能为空',
  })
  @MaxLength(50, {
    message: '会议室名称不能超过50个字符',
  })
  name: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '会议室容量不能为空',
  })
  capacity: number;

  @ApiProperty()
  @IsNotEmpty({
    message: '会议室位置不能为空',
  })
  @MaxLength(50, {
    message: '会议室位置不能超过50个字符',
  })
  location: string;

  // @IsNotEmpty({
  //   message: '会议室设备不能为空',
  // })
  @ApiProperty()
  @MaxLength(50, {
    message: '会议室设备不能超过50个字符',
  })
  equipment: string;

  // @IsNotEmpty({
  //   message: '会议室描述不能为空',
  // })
  @ApiProperty()
  @MaxLength(100, {
    message: '会议室描述不能超过100个字符',
  })
  description: string;
}
