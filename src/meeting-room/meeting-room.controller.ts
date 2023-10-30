import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  HttpStatus,
} from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { generateParseIntPipe } from '../utils';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequireLogin } from '../custom.decorator';
import { MeetingRoomVo } from './vo/meeting-room.vo';
import { MeetingRoomListVo } from './vo/meeting-room-list.vo';

@ApiTags('会议室管理模块')
@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Get('initData')
  async initData() {
    return await this.meetingRoomService.initData();
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNum',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'name',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'capacity',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'equipment',
    type: String,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: MeetingRoomListVo,
  })
  @Get('list')
  @RequireLogin()
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

  @ApiBearerAuth()
  @ApiBody({ type: CreateMeetingRoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '创建成功',
    type: MeetingRoomVo,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '会议室名称已存在',
  })
  @Post('create')
  @RequireLogin()
  async create(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return await this.meetingRoomService.create(createMeetingRoomDto);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateMeetingRoomDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: MeetingRoomVo,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '会议室不存在',
  })
  @Post('update')
  @RequireLogin()
  async update(@Body() updateMeetingRoomDto: UpdateMeetingRoomDto) {
    return await this.meetingRoomService.update(updateMeetingRoomDto);
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: '会议室id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MeetingRoomVo,
    description: '查询成功',
  })
  @Get(':id')
  @RequireLogin()
  async findOneById(@Param('id') id: string) {
    return await this.meetingRoomService.findOneById(+id);
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: '会议室id' })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  @Delete(':id')
  @RequireLogin()
  async deleteById(@Param('id') id: string) {
    return await this.meetingRoomService.deleteById(+id);
  }
}
