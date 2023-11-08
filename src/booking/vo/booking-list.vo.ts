import { ApiProperty } from '@nestjs/swagger';
import { BookingVo } from './booking.vo';

export class BookingListVo {
  @ApiProperty({
    type: [BookingVo],
  })
  meetingRooms: Array<BookingVo>;

  @ApiProperty()
  totalCount: number;
}
