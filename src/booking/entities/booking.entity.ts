import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MeetingRoom } from '../../meeting-room/entities/meeting-room.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '会议开始时间',
  })
  startTime: Date;

  @Column({
    comment: '会议结束时间',
  })
  endTime: Date;

  @Column({
    length: 20,
    comment: '状态(申请中=1、审批通过=2、审批驳回=3、已解除=4)',
    default: '1',
  })
  status: string;

  @Column({
    length: 100,
    comment: '备注',
    default: '',
  })
  note: string;

  // 预定表中有多个人预定会议室，所以是多对一的关系, 一个用户可以预定多个会议室。这里预定表是主表，用户表是从表，所以是多对一的关系。
  // restrict 是只有从表没有相关记录，才可以删除主表记录
  @ManyToOne(() => User)
  user: User;

  // 同理
  @ManyToOne(() => MeetingRoom)
  room: MeetingRoom;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;
}
