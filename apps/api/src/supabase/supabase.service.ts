import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { accountsEnabled, config } from '../config.js';

const noSession = { persistSession: false, autoRefreshToken: false };

/**
 * Two ways into the database:
 *  - `forUser(token)` acts as the signed-in visitor, so row-level security still
 *    decides what they can see. Used for everything a user does to their own rows.
 *  - `admin` acts as the service and bypasses RLS. Only for the billing webhook,
 *    account deletion and Pro source — never return its rows without checking whose they are.
 */
@Injectable()
export class SupabaseService {
  private adminClient: SupabaseClient | null = null;

  get admin(): SupabaseClient {
    this.assertEnabled();
    this.adminClient ??= createClient(config.supabaseUrl, config.supabaseSecretKey, { auth: noSession });
    return this.adminClient;
  }

  forUser(accessToken: string): SupabaseClient {
    this.assertEnabled();
    return createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: noSession,
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }

  private assertEnabled() {
    if (!accountsEnabled) throw new ServiceUnavailableException("Accounts aren't switched on yet");
  }
}
