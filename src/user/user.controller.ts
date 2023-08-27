import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserVo } from './vo/login-user.vo';
import { RequireLogin, UserInfo } from '../custom.decorator';
import { UserInfoVo } from './vo/user-info.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  @Inject(RedisService)
  private readonly redisService: RedisService;
  @Inject(EmailService)
  private emailService: EmailService;
  @Inject(JwtService)
  private jwtService: JwtService;
  @Inject(ConfigService)
  private configService: ConfigService;

  constructor(private readonly userService: UserService) {}

  setToken(vo: LoginUserVo) {
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '30m',
      },
    );
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN') ?? '7d',
      },
    );
    return vo;
  }

  async refreshToken(refreshToken: string, isAdmin = false) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(data.userId, isAdmin);
      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '30m',
        },
      );
      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN') ?? '7d',
        },
      );
      return {
        access_token,
        refresh_token,
      };
    } catch (e) {
      throw new UnauthorizedException('refreshToken无效，请重新登录');
    }
  }

  // ---
  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return '初始化成功';
  }

  // ---
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 60 * 5);
    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `您的注册验证码为${code},有效期为5分钟`,
    });
    return '验证码已发送';
  }

  // ---
  @Post('login')
  async login(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser);
    return this.setToken(vo);
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true);
    return this.setToken(vo);
  }

  // ---
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    return await this.refreshToken(refreshToken);
  }

  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    return await this.refreshToken(refreshToken, true);
  }

  // ---
  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);
    const vo = new UserInfoVo();
    vo.id = user.id;
    vo.username = user.username;
    vo.nickName = user.nickName;
    vo.email = user.email;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.isFreeze = user.isFreeze;
    vo.createTime = user.createTime;
    vo.updateTime = user.updateTime;
    return vo;
  }

  // ---
  @Post(['update_password', 'admin/update_password'])
  @RequireLogin()
  async updatePassword(
    @UserInfo('userId') userId: number,
    @Body() updateUserPassword: UpdateUserPasswordDto,
  ) {
    return await this.userService.updatePassword(userId, updateUserPassword);
  }

  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(
      `update_password_captcha_${address}`,
      code,
      60 * 5,
    );
    await this.emailService.sendMail({
      to: address,
      subject: '修改密码验证码',
      html: `您的修改密码验证码为${code},有效期为5分钟`,
    });
    return '验证码已发送';
  }

  // ---
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUser: UpdateUserDto,
  ) {
    return await this.userService.update(userId, updateUser);
  }

  @Get('update/captcha')
  async updateCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`update_captcha_${address}`, code, 60 * 5);
    await this.emailService.sendMail({
      to: address,
      subject: '修改信息验证码',
      html: `您的修改信息验证码为${code},有效期为5分钟`,
    });
    return '验证码已发送';
  }
}
