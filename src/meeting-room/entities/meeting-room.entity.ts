import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MeetingRoom {
  @PrimaryGeneratedColumn({
    comment: '会议室ID',
  })
  id: number;

  @Column({
    length: 50,
    comment: '会议室名称',
  })
  name: string;

  @Column({
    comment: '会议室容量',
  })
  capacity: number;

  @Column({
    length: 50,
    comment: '会议室位置',
  })
  location: string;

  @Column({
    length: 50,
    comment: '会议室设备',
    default: '',
  })
  equipment: string;

  @Column({
    length: 100,
    comment: '会议室描述',
    default: '',
  })
  description: string;

  @Column({
    comment: '会议室是否被预定',
    default: false,
  })
  isBooked: boolean;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createdTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  updatedTime: Date;
}
