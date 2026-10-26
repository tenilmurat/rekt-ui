import {
  BadGatewayException,
  Controller,
  Delete,
  HttpCode,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUser, type AuthUser } from '../auth/auth.guard.js';
import { PaddleService } from '../billing/paddle.service.js';
import { readPlan } from '../plans.js';
import { SupabaseService } from '../supabase/supabase.service.js';

@Controller('account')
@UseGuards(AuthGuard)
export class AccountController {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly paddle: PaddleService,
  ) {}

  /**
   * Deletes the caller's account. A renewing plan is cancelled first so nobody
   * is charged for an account that no longer exists; profile, bookmarks and plan
   * rows go with the user through `on delete cascade`.
   */
  @Delete()
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser): Promise<void> {
    const plan = await readPlan(this.supabase.forUser(user.token), user.id);
    if (plan?.subscription_id && plan.status !== 'canceled') {
      try {
        await this.paddle.cancelNow(plan.subscription_id);
      } catch {
        throw new BadGatewayException("Couldn't cancel your plan, so the account was kept. Try again or write to us.");
      }
    }

    const { error } = await this.supabase.admin.auth.admin.deleteUser(user.id);
    if (error) throw new InternalServerErrorException(error.message);
  }
}
