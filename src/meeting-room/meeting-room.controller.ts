import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { generateParseIntPipe } from '../utils';

@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Get('initData')
  async initData() {
    return await this.meetingRoomService.initData();
  }

  @Get('list')
  async list(
    @Query('pageNum', new DefaultValuePipe(1), generateParseIntPipe('pageNum'))
    pageNum: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(20),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('name') name: string,
    @Query('equipment') equipment: string,
    @Query('capacity') capacity: number,
  ) {
    return await this.meetingRoomService.list({
      pageNum,
      pageSize,
      name,
      equipment,
      capacity,
    });
  }

  @Post('create')
  async create(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return await this.meetingRoomService.create(createMeetingRoomDto);
  }

  @Post('update')
  async update(@Body() updateMeetingRoomDto: UpdateMeetingRoomDto) {
    return await this.meetingRoomService.update(updateMeetingRoomDto);
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return await this.meetingRoomService.findOneById(+id);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    return await this.meetingRoomService.deleteById(+id);
  }
}
