import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from '../redis/redis.service';
import { md5 } from '../utils';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListVo } from './vo/user-list.vo';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Role)
  private readonly roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private readonly permissionRepository: Repository<Permission>;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);
    if (!captcha) {
      // 不在 redis 里,数据过期被删除了
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }
    if (user.captcha !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });
    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    const newUser = new User();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;
    newUser.nickName = user.nickName;

    try {
      await this.userRepository.save(newUser);
      return '注册成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '注册失败';
    }
  }

  // 上线的时候需要删除该代码,直接导出 sql 文件初始化数据库就行
  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = md5('1111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('222222');
    user2.email = 'yyy@yy.com';
    user2.nickName = '李四';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }

  async login(loginUser: LoginUserDto, isAdmin = false) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (user.password !== md5(loginUser.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }
    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isFreeze: user.isFreeze,
      isAdmin: user.isAdmin,
      createTime: user.createTime,
      updateTime: user.updateTime,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((acc, cur) => {
        cur.permissions.forEach((item) => {
          if (acc.findIndex((t) => t.code === item.code) === -1) {
            acc.push(item);
          }
        });
        return acc;
      }, []),
    };
    return vo;
  }

  async findUserById(userId: number, isAdmin = false) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      email: user.email,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((acc, cur) => {
        cur.permissions.forEach((item) => {
          if (acc.findIndex((t) => t.code === item.code) === -1) {
            acc.push(item);
          }
        });
        return acc;
      }, []),
    };
  }

  async findUserDetailById(userId: number, isAdmin = false) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    return user;
  }

  async updatePassword(updateUserPassword: UpdateUserPasswordDto) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${updateUserPassword.email}`,
    );
    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }
    if (captcha !== updateUserPassword.captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.userRepository.findOneBy({
      username: updateUserPassword.username,
    });

    if (foundUser.email !== updateUserPassword.email) {
      throw new HttpException('用户名和邮箱不匹配', HttpStatus.BAD_REQUEST);
    }

    foundUser.password = md5(updateUserPassword.password);

    try {
      await this.userRepository.save(foundUser);
      return '修改密码成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '修改密码失败';
    }
  }

  async update(userId: number, updateUser: UpdateUserDto) {
    const captcha = await this.redisService.get(
      `update_user_captcha_${updateUser.email}`,
    );
    if (!captcha) {
      throw new HttpException('验证码已过期', HttpStatus.BAD_REQUEST);
    }
    if (captcha !== updateUser.captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }
    const foundUser = await this.userRepository.findOneBy({
      id: userId,
    });

    foundUser.headPic = updateUser?.headPic;
    foundUser.nickName = updateUser?.nickName;

    try {
      await this.userRepository.save(foundUser);
      return '用户信息修改成功';
    } catch (e) {
      this.logger.error(e, UserService);
      return '用户信息修改失败';
    }
  }

  async freezeUserById(userId: number) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });
    user.isFreeze = true;
    await this.userRepository.save(user);
  }

  async findUserByPage({
    pageNum,
    pageSize,
    userName,
    nickName,
    email,
  }: {
    pageNum: number;
    pageSize: number;
    userName: string;
    nickName: string;
    email: string;
  }) {
    const skipCount = (pageNum - 1) * pageSize;
    const condition: Record<string, any> = {};
    if (userName) {
      // 模糊查询 %王% （包含王字）  王%（王开头的）
      condition.username = Like(`%${userName}%`);
    }
    if (nickName) {
      condition.nickName = Like(`%${nickName}%`);
    }
    if (email) {
      condition.email = Like(`%${email}%`);
    }
    const [users, totalCount] = await this.userRepository.findAndCount({
      select: [
        'id',
        'username',
        'nickName',
        'email',
        'headPic',
        'phoneNumber',
        'isFreeze',
        'isAdmin',
        'createTime',
        'updateTime',
      ],
      skip: skipCount, // 从哪里开始取 SELECT * FROM `user` LIMIT 2,4 （从第2条开始，也就是第3个，取了4条数据）
      take: pageSize, // 取多少条
      where: condition,
    });

    const vo = new UserListVo();
    vo.users = users;
    vo.totalCount = totalCount;
    return vo;
  }
}
