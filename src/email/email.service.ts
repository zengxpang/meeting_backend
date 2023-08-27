import { Injectable } from '@nestjs/common';
import { Transporter, createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  transporter: Transporter;
  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      host: configService.get('NODEMAILER_SERVER_HOST'),
      port: configService.get('NODEMAILER_SERVER_PORT'),
      secure: false,
      auth: {
        user: configService.get('NODEMAILER_SERVER_AUTH_USER'),
        pass: configService.get('NODEMAILER_SERVER_AUTH_PASS'),
      },
    });
  }
  async sendMail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预定系统',
        address: '2531069259@qq.com',
      },
      to,
      subject,
      html,
    });
  }
}
