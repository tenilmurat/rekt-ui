import { createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { config } from '../config.js';

/**
 * Paddle is the merchant of record: it charges, handles VAT and invoices, and
 * tells us what happened through a signed webhook. Card details never reach us.
 * Everything Paddle-specific lives here, so another provider is a swap of this class.
 */
@Injectable()
export class PaddleService {
  private readonly base =
    config.paddleEnv === 'production' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';

  /**
   * Checks the `Paddle-Signature` header (`ts=…;h1=…`): an HMAC-SHA256 of
   * `ts:rawBody` with the endpoint's secret. Anything older than five minutes
   * is refused so a captured request can't be replayed.
   */
  verifyWebhook(rawBody: string, header: string | undefined): boolean {
    if (!config.paddleWebhookSecret || !header) return false;

    const parts = Object.fromEntries(header.split(';').map((p) => p.split('=') as [string, string]));
    const ts = Number(parts.ts);
    if (!parts.h1 || !Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

    const expected = createHmac('sha256', config.paddleWebhookSecret)
      .update(`${parts.ts}:${rawBody}`)
      .digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(parts.h1);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  /** A one-time link into Paddle's customer portal: invoices, card, cancel. */
  async portalUrl(customerId: string, subscriptionId?: string | null): Promise<string> {
    const { data } = await this.post<{ data: { urls: { general: { overview: string } } } }>(
      `/customers/${customerId}/portal-sessions`,
      subscriptionId ? { subscription_ids: [subscriptionId] } : {},
    );
    return data.urls.general.overview;
  }

  /** Stops a renewing plan straight away — used when an account is deleted. */
  async cancelNow(subscriptionId: string): Promise<void> {
    await this.post(`/subscriptions/${subscriptionId}/cancel`, { effective_from: 'immediately' });
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    if (!config.paddleApiKey) throw new ServiceUnavailableException('Billing is not set up yet');
    const res = await fetch(`${this.base}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.paddleApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Paddle ${path} failed: ${res.status} ${await res.text()}`);
    return (await res.json()) as T;
  }
}
