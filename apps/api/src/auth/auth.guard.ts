import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SupabaseService } from '../supabase/supabase.service.js';

export type AuthUser = { id: string; email: string; token: string };

type AuthedRequest = Request & { user?: AuthUser };

/**
 * The frontend signs in with Supabase and sends its access token as
 * `Authorization: Bearer <token>`. Supabase checks the token, so a forged or
 * expired one is rejected here before any handler runs.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new UnauthorizedException('Sign in first');

    const { data, error } = await this.supabase.admin.auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException('Your session has expired — sign in again');

    req.user = { id: data.user.id, email: data.user.email ?? '', token };
    return true;
  }
}

/** The signed-in user, in a handler behind AuthGuard. */
export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<AuthedRequest>().user!,
);
