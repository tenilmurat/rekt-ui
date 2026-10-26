import type { SupabaseClient } from '@supabase/supabase-js';

export type PlanId = 'free' | 'pro' | 'lifetime';

/** Paddle statuses that still unlock Pro. A cancelled plan stays active until its period ends. */
export const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];

export type PlanRow = {
  plan: 'pro' | 'lifetime';
  status: string;
  current_period_end: string | null;
  customer_id: string | null;
  subscription_id: string | null;
};

export function planOf(row: Pick<PlanRow, 'plan' | 'status'> | null): PlanId {
  return row && ACTIVE_STATUSES.includes(row.status) ? row.plan : 'free';
}

/** The plan row for one user, or null when they have never paid. */
export async function readPlan(db: SupabaseClient, userId: string): Promise<PlanRow | null> {
  const { data } = await db
    .from('subscriptions')
    .select('plan, status, current_period_end, customer_id, subscription_id')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as PlanRow | null) ?? null;
}
