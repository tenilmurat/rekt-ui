import { Controller, ForbiddenException, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { AuthGuard, CurrentUser, type AuthUser } from '../auth/auth.guard.js';
import { planOf, readPlan } from '../plans.js';
import { SupabaseService } from '../supabase/supabase.service.js';

export type ComponentSource = {
  id: string;
  title: string;
  usage: string;
  files: { path: string; code: string }[];
  dependencies: string[];
};

/**
 * Pro source, for Pro accounts only. It is read from `component_sources`, which
 * only the secret key can reach — the source is never in either public repo.
 */
@Controller('components')
@UseGuards(AuthGuard)
export class ComponentsController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get(':id/source')
  async source(@CurrentUser() user: AuthUser, @Param('id') id: string): Promise<ComponentSource> {
    const plan = planOf(await readPlan(this.supabase.forUser(user.token), user.id));
    if (plan === 'free') throw new ForbiddenException('This component comes with Pro');

    const { data } = await this.supabase.admin
      .from('component_sources')
      .select('id, title, usage, files, dependencies')
      .eq('id', id)
      .maybeSingle();
    if (!data) throw new NotFoundException('No source for that component yet');
    return data as ComponentSource;
  }
}
