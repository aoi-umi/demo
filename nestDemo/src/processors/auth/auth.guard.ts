import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import * as authDeco from './auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const auth = this.reflector.get<authDeco.AuthOptions>(
      authDeco.authKey,
      context.getHandler(),
    );
    if (!auth?.authority?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return false;
  }
}
