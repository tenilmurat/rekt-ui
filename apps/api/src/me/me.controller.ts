import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser, type AuthUser } from '../auth/auth.guard.js';
import { planOf, readPlan, type PlanId } from '../plans.js';
import { SupabaseService } from '../supabase/supabase.service.js';

export type MeResponse = {
  account: { id: string; email: string; name: string | null; avatarUrl: string | null };
  plan: PlanId;
  planStatus: string | null;
  periodEnd: string | null;
  bookmarks: { kind: 'component' | 'design'; id: string }[];
};

/** Everything the frontend needs after sign-in, in one request. */
@Controller('me')
@UseGuards(AuthGuard)
export class MeController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  async me(@CurrentUser() user: AuthUser): Promise<MeResponse> {
    const db = this.supabase.forUser(user.token);
    const [profile, plan, marks] = await Promise.all([
      db.from('profiles').select('name, avatar_url').eq('id', user.id).maybeSingle(),
      readPlan(db, user.id),
      db.from('bookmarks').select('kind, item_id').order('created_at', { ascending: false }),
    ]);

    return {
      account: {
        id: user.id,
        email: user.email,
        name: profile.data?.name ?? null,
        avatarUrl: profile.data?.avatar_url ?? null,
      },
      plan: planOf(plan),
      planStatus: plan?.status ?? null,
      periodEnd: plan?.current_period_end ?? null,
      bookmarks: (marks.data ?? []).map((m) => ({ kind: m.kind, id: m.item_id })),
    };
  }
}
