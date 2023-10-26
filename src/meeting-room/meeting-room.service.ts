import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private readonly meetingRoomRepository: Repository<MeetingRoom>;

  async initData() {
    const room1 = new MeetingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '一层西';

    const room2 = new MeetingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '二层东';

    const room3 = new MeetingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '三层东';

    await this.meetingRoomRepository.insert([room1, room2, room3]);
  }

  async list({
    pageNum,
    pageSize,
    name,
    equipment,
    capacity,
  }: {
    pageNum: number;
    pageSize: number;
    name: string;
    equipment: string;
    capacity: number;
  }) {
    if (pageNum < 1) {
      throw new BadRequestException('页码不能小于1');
    }
    const skipCount = (pageNum - 1) * pageSize;
    const condition: Record<string, any> = {};

    if (name) {
      condition.name = Like(`%${name}%`);
    }

    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }

    if (capacity) {
      condition.capacity = capacity;
    }

    const [meetingRooms, totalCount] =
      await this.meetingRoomRepository.findAndCount({
        skip: skipCount,
        take: pageSize,
        where: condition,
      });
    return {
      meetingRooms,
      totalCount,
    };
  }

  async create(createMeetingRoomDto: CreateMeetingRoomDto) {
    const meetingRoom = await this.meetingRoomRepository.findOneBy({
      name: createMeetingRoomDto.name,
    });
    if (meetingRoom) {
      throw new BadRequestException('会议室已存在');
    }

    return await this.meetingRoomRepository.insert(createMeetingRoomDto);
  }

  async update(updateMeetingRoomDto: UpdateMeetingRoomDto) {
    const meetingRoom = await this.meetingRoomRepository.findOneBy({
      id: updateMeetingRoomDto.id,
    });
    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    meetingRoom.name = updateMeetingRoomDto.name;
    meetingRoom.capacity = updateMeetingRoomDto.capacity;
    meetingRoom.location = updateMeetingRoomDto.location;

    if (updateMeetingRoomDto.equipment) {
      meetingRoom.equipment = updateMeetingRoomDto.equipment;
    }

    if (updateMeetingRoomDto.description) {
      meetingRoom.description = updateMeetingRoomDto.description;
    }

    await this.meetingRoomRepository.update(
      {
        id: updateMeetingRoomDto.id,
      },
      meetingRoom,
    );

    return meetingRoom;
  }

  async findOneById(id: number) {
    return await this.meetingRoomRepository.findOneBy({
      id,
    });
  }

  async deleteById(id: number) {
    await this.meetingRoomRepository.delete({
      id,
    });
    return '删除成功';
  }
}
