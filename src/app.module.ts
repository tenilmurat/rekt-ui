import { Module } from '@nestjs/common';
import { AccountController } from './account/account.controller.js';
import { AppController } from './app.controller.js';
import { BillingController } from './billing/billing.controller.js';
import { PaddleService } from './billing/paddle.service.js';
import { BookmarksController } from './bookmarks/bookmarks.controller.js';
import { ComponentsController } from './components/components.controller.js';
import { MeController } from './me/me.controller.js';
import { SupabaseModule } from './supabase/supabase.module.js';

@Module({
  imports: [SupabaseModule],
  controllers: [
    AppController,
    MeController,
    BookmarksController,
    BillingController,
    AccountController,
    ComponentsController,
  ],
  providers: [PaddleService],
})
export class AppModule {}
