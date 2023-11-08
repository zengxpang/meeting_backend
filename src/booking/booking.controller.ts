import {
  Controller,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  HttpStatus,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { generateParseIntPipe } from '../utils';
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequireLogin } from '../custom.decorator';
import { BookingListVo } from './vo/booking-list.vo';

@ApiTags('预约管理模块')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('initData')
  async initData() {
    return await this.bookingService.initData();
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
    name: 'username',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'meetingRoomName',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'meetingRoomPosition',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'bookingTimeRangeStart',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'bookingTimeRangeEnd',
    type: Number,
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: BookingListVo,
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
    @Query('username') username: string,
    @Query('meetingRoomName') meetingRoomName: string,
    @Query('meetingRoomPosition') meetingRoomPosition: string,
    @Query('bookingTimeRangeStart')
    bookingTimeRangeStart: number,
    @Query('bookingTimeRangeEnd')
    bookingTimeRangeEnd: number,
  ) {
    return await this.bookingService.list({
      pageNum,
      pageSize,
      username,
      meetingRoomName,
      meetingRoomPosition,
      bookingTimeRangeStart,
      bookingTimeRangeEnd,
    });
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '预定申请成功',
    type: String,
  })
  @Get('apply/:id')
  @RequireLogin()
  async apply(@Param('id') id: number) {
    return await this.bookingService.apply(id);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '审批驳回预定成功',
    type: String,
  })
  @Get('reject/:id')
  @RequireLogin()
  async reject(@Param('id') id: number) {
    return this.bookingService.reject(id);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '解除预定成功',
    type: String,
  })
  @Get('unbind/:id')
  @RequireLogin()
  async unbind(@Param('id') id: number) {
    return this.bookingService.unbind(id);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '催办预定成功',
    type: String,
  })
  @Get('urge/:id')
  @RequireLogin()
  async urge(@Param('id') id: number) {
    return this.bookingService.urge(id);
  }
}
