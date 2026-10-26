import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  InternalServerErrorException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUser, type AuthUser } from '../auth/auth.guard.js';
import { SupabaseService } from '../supabase/supabase.service.js';

const KINDS = ['component', 'design'];

/**
 * PUT saves, DELETE removes; both are safe to repeat. Ids are the ones used in
 * the frontend's code, so content stays in the repo, not the database.
 */
@Controller('bookmarks')
@UseGuards(AuthGuard)
export class BookmarksController {
  constructor(private readonly supabase: SupabaseService) {}

  @Put(':kind/:id')
  @HttpCode(204)
  async save(@CurrentUser() user: AuthUser, @Param('kind') kind: string, @Param('id') id: string) {
    this.check(kind, id);
    const { error } = await this.supabase
      .forUser(user.token)
      .from('bookmarks')
      .upsert({ user_id: user.id, kind, item_id: id }, { ignoreDuplicates: true });
    if (error) throw new InternalServerErrorException("Couldn't save that — try again");
  }

  @Delete(':kind/:id')
  @HttpCode(204)
  async remove(@CurrentUser() user: AuthUser, @Param('kind') kind: string, @Param('id') id: string) {
    this.check(kind, id);
    const { error } = await this.supabase
      .forUser(user.token)
      .from('bookmarks')
      .delete()
      .match({ user_id: user.id, kind, item_id: id });
    if (error) throw new InternalServerErrorException("Couldn't remove that — try again");
  }

  private check(kind: string, id: string) {
    if (!KINDS.includes(kind)) throw new BadRequestException('kind must be "component" or "design"');
    if (!/^[\w-]{1,120}$/.test(id)) throw new BadRequestException('Unknown item id');
  }
}
