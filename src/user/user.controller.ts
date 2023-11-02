import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Inject,
  ParseIntPipe,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
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
import { generateParseIntPipe } from '../utils';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RefreshTokenVo } from './vo/refresh-token.vo';
import { UserListVo } from './vo/user-list.vo';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as path from 'path';
import { storage } from 'src/my-file-storage';

@ApiTags('用户管理模块')
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

  async refreshToken(refreshToken: string, isAdmin = false) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(data.userId, isAdmin);
      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          email: user.email,
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
      const vo = new RefreshTokenVo();
      vo.access_token = access_token;
      vo.refresh_token = refresh_token;
      return vo;
    } catch (e) {
      throw new UnauthorizedException('token无效，请重新登录');
    }
  }

  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return '初始化成功';
  }

  @ApiBody({
    type: RegisterUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已过期/验证码错误/用户已存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/注册失败',
    type: String,
  })
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @ApiQuery({
    name: 'address',
    type: String,
    description: '邮箱地址',
    required: true,
    example: 'xxx@xx.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '验证码已发送',
    type: String,
  })
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

  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和token',
    type: LoginUserVo,
  })
  @Post('login')
  async login(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser);
    return this.userService.setToken(vo);
  }

  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和token',
    type: LoginUserVo,
  })
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true);
    return this.userService.setToken(vo);
  }

  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新token',
    required: true,
    example: 'xxx...',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token无效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    return await this.refreshToken(refreshToken);
  }

  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新token',
    required: true,
    example: 'xxx...',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token无效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    return await this.refreshToken(refreshToken, true);
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: UserInfoVo,
  })
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

  @ApiBody({
    type: UpdateUserPasswordDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已过期/验证码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '修改密码成功/修改密码失败',
    type: String,
  })
  @Post(['update_password', 'admin/update_password'])
  async updatePassword(@Body() updateUserPassword: UpdateUserPasswordDto) {
    return await this.userService.updatePassword(updateUserPassword);
  }

  @ApiQuery({
    name: 'address',
    type: String,
    description: '邮箱地址',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '验证码已发送',
  })
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

  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: String,
    description: '验证码已过期/验证码错误',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: String,
    description: '用户修改信息成功/用户修改信息失败',
  })
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUser: UpdateUserDto,
  ) {
    return await this.userService.update(userId, updateUser);
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: '验证码已发送',
  })
  @Get('update/captcha')
  @RequireLogin()
  async updateCaptcha(@UserInfo('email') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`update_user_captcha_${address}`, code, 60 * 5);
    await this.emailService.sendMail({
      to: address,
      subject: '修改信息验证码',
      html: `您的修改信息验证码为${code},有效期为5分钟`,
    });
    return '验证码已发送';
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'userId',
    type: Number,
    description: '用户id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
  })
  @Get('freeze')
  @RequireLogin()
  async freeze(@Query('userId') userId: number) {
    await this.userService.freezeUserById(userId);
    return 'success';
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNum',
    description: '页码',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页条数',
    type: Number,
  })
  @ApiQuery({
    name: 'userName',
    description: '用户名',
    type: String,
  })
  @ApiQuery({
    name: 'nickName',
    description: '昵称',
    type: String,
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户列表',
    type: UserListVo,
  })
  @Get('list')
  @RequireLogin()
  async list(
    @Query('pageNum', new DefaultValuePipe(1), generateParseIntPipe('pageNum'))
    pageNum: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('userName') userName: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
  ) {
    return await this.userService.findUserByPage({
      pageNum,
      pageSize,
      userName,
      nickName,
      email,
    });
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      storage,
      limits: {
        fieldSize: 1024 * 1024 * 3,
      },
      fileFilter: (req, file, cb) => {
        const extname = path.extname(file.originalname);
        if (['.png', '.jpg', '.jpeg', '.gif'].includes(extname)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              '文件格式错误,只支持.png、.jpeg、.jpg、.gif格式',
            ),
            false,
          );
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    return file.path;
  }
}
