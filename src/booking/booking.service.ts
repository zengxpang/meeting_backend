import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Between, EntityManager, Like } from 'typeorm';
import { MeetingRoom } from '../meeting-room/entities/meeting-room.entity';
import { User } from '../user/entities/user.entity';
import { Booking } from './entities/booking.entity';
import { EmailService } from '../email/email.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class BookingService {
  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject()
  private readonly redisService: RedisService;

  @Inject()
  private readonly emailService: EmailService;

  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: 1,
    });
    const user2 = await this.entityManager.findOneBy(User, {
      id: 2,
    });

    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 1,
    });
    const room2 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 2,
    });

    const booking1 = new Booking();
    booking1.room = room1;
    booking1.user = user1;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);
    await this.entityManager.save(Booking, booking1);

    const booking2 = new Booking();
    booking2.room = room2;
    booking2.user = user2;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);
    await this.entityManager.save(Booking, booking2);

    const booking3 = new Booking();
    booking3.room = room1;
    booking3.user = user2;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);
    await this.entityManager.save(Booking, booking3);

    const booking4 = new Booking();
    booking4.room = room2;
    booking4.user = user1;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);
    await this.entityManager.save(Booking, booking4);
  }

  async list({
    pageNum,
    pageSize,
    username,
    meetingRoomName,
    meetingRoomPosition,
    bookingTimeRangeStart,
    bookingTimeRangeEnd,
  }: {
    pageNum: number;
    pageSize: number;
    username: string;
    meetingRoomName: string;
    meetingRoomPosition: string;
    bookingTimeRangeStart: number;
    bookingTimeRangeEnd: number;
  }) {
    if (pageNum < 1) {
      throw new BadRequestException('页码不能小于1');
    }

    const skipCount = (pageNum - 1) * pageSize;
    const condition: Record<string, any> = {};

    if (username) {
      condition.user = {
        username: Like(`%${username}%`),
      };
    }

    if (meetingRoomName) {
      condition.room = {
        name: Like(`%${meetingRoomName}%`),
      };
    }

    if (meetingRoomPosition) {
      if (!condition.room) {
        condition.room = {};
      }
      condition.room.location = Like(`%${meetingRoomPosition}%`);
    }

    if (bookingTimeRangeStart) {
      if (!bookingTimeRangeEnd) {
        bookingTimeRangeEnd = Number(bookingTimeRangeStart) + 60 * 60 * 1000;
      }
      condition.startTime = Between(
        new Date(Number(bookingTimeRangeStart)),
        new Date(Number(bookingTimeRangeEnd)),
      );
    }

    const [bookings, totalCount] = await this.entityManager.findAndCount(
      Booking,
      {
        where: condition,
        relations: {
          user: true,
          room: true,
        },
        skip: skipCount,
        take: pageSize,
      },
    );

    return {
      totalCount,
      bookings: bookings.map((booking) => {
        delete booking.user.password;
        return booking;
      }),
    };
  }

  async apply(id: number) {
    await this.entityManager.update(Booking, { id }, { status: '2' });
    return 'success';
  }

  async reject(id: number) {
    await this.entityManager.update(
      Booking,
      {
        id,
      },
      {
        status: '3',
      },
    );
    return 'success';
  }

  async unbind(id: number) {
    await this.entityManager.update(
      Booking,
      {
        id,
      },
      {
        status: '4',
      },
    );
    return 'success';
  }

  async urge(id: number) {
    const flag = await this.redisService.get(`urge_${id}`);
    if (flag) {
      return '半小时内只能催办一次，请耐心等待!';
    }

    let email = await this.redisService.get(`admin_email`);
    if (!email) {
      const admin = await this.entityManager.findOne(User, {
        select: {
          email: true,
        },
        where: {
          isAdmin: true,
        },
      });
      email = admin.email;
      await this.redisService.set(`admin_email`, email);
    }

    await this.emailService.sendMail({
      to: email,
      subject: '预定申请催办提醒',
      html: `<p>您有一条id为${id}的预定申请需要审批，请及时处理！</p>`,
    });

    await this.redisService.set(`urge_${id}`, '1', 60 * 30);

    return 'success';
  }
}
