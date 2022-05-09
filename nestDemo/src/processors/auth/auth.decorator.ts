import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

export type AuthOptions = { authority?: string[] };

export const authKey = 'auth';

export function Auth(opt?: AuthOptions) {
  return applyDecorators(SetMetadata(authKey, opt), UseGuards(AuthGuard));
}
