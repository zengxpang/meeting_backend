import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (!request.user) {
      // 登录接口不需要权限
      return true;
    }
    const permissions = request.user.permissions;
    const requirePermissions = this.reflector.getAllAndOverride(
      'require-permission',
      [context.getHandler(), context.getClass()],
    );

    if (!requirePermissions) {
      // 没有设置 require-permission 装饰器，不需要权限
      return true;
    }

    for (let i = 0; i < requirePermissions.length; i++) {
      const currentPermission = requirePermissions[i];
      const found = permissions.find((item) => item.code === currentPermission);
      if (!found) {
        throw new UnauthorizedException('你没有该接口的访问权限');
      }
    }
    return true;
  }
}
