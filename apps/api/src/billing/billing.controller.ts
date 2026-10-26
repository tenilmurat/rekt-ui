import {
  BadGatewayException,
  Controller,
  Headers,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard, CurrentUser, type AuthUser } from '../auth/auth.guard.js';
import { config } from '../config.js';
import { readPlan } from '../plans.js';
import { SupabaseService } from '../supabase/supabase.service.js';
import { PaddleService } from './paddle.service.js';

type PaddleEvent = {
  event_type: string;
  data: {
    id: string;
    status: string;
    customer_id: string | null;
    custom_data?: { user_id?: string } | null;
    current_billing_period?: { ends_at: string } | null;
    items?: { price?: { id: string } | null }[];
  };
};

@Controller('billing')
export class BillingController {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly paddle: PaddleService,
  ) {}

  /** Sends a paying user to Paddle's portal for invoices, card changes and cancelling. */
  @Post('portal')
  @UseGuards(AuthGuard)
  async portal(@CurrentUser() user: AuthUser): Promise<{ url: string }> {
    const plan = await readPlan(this.supabase.forUser(user.token), user.id);
    if (!plan?.customer_id) throw new NotFoundException('No billing account yet');
    try {
      return { url: await this.paddle.portalUrl(plan.customer_id, plan.subscription_id) };
    } catch {
      throw new BadGatewayException('Billing is unavailable right now');
    }
  }

  /**
   * Paddle → `subscriptions`. Subscribe the destination to transaction.completed
   * and subscription.created / updated / canceled. Checkout passes
   * `customData.user_id`, which Paddle copies onto the transaction and the
   * subscription it creates; later subscription events match by subscription id.
   */
  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('paddle-signature') signature: string | undefined,
  ): Promise<{ ok: true }> {
    const raw = req.rawBody?.toString('utf8') ?? '';
    if (!this.paddle.verifyWebhook(raw, signature)) throw new UnauthorizedException('Invalid signature');

    const { event_type, data } = JSON.parse(raw) as PaddleEvent;
    const userId = data.custom_data?.user_id;
    const db = this.supabase.admin;
    const now = new Date().toISOString();

    if (event_type === 'transaction.completed') {
      const isLifetime = data.items?.some((i) => i.price?.id === config.paddlePriceLifetime);
      // Renewing plans are recorded from their subscription events below.
      if (!isLifetime || !userId) return { ok: true };

      const { error } = await db.from('subscriptions').upsert({
        user_id: userId,
        plan: 'lifetime',
        status: 'active',
        customer_id: data.customer_id,
        subscription_id: null,
        transaction_id: data.id,
        current_period_end: null,
        updated_at: now,
      });
      if (error) throw new InternalServerErrorException(error.message);
      return { ok: true };
    }

    if (event_type.startsWith('subscription.')) {
      const row = {
        plan: 'pro',
        status: data.status,
        customer_id: data.customer_id,
        subscription_id: data.id,
        current_period_end: data.current_billing_period?.ends_at ?? null,
        updated_at: now,
      };

      // Never let a renewing plan overwrite a lifetime one.
      if (userId && (await readPlan(db, userId))?.plan === 'lifetime') return { ok: true };

      const { error } = userId
        ? await db.from('subscriptions').upsert({ user_id: userId, ...row })
        : await db.from('subscriptions').update(row).eq('subscription_id', data.id);
      if (error) throw new InternalServerErrorException(error.message);
    }

    return { ok: true };
  }
}
