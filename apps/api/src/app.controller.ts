import { Controller, Get } from '@nestjs/common';
import { accountsEnabled } from './config.js';

@Controller()
export class AppController {
  @Get()
  info(): { name: string; accounts: boolean } {
    return { name: 'Rekt UI API', accounts: accountsEnabled };
  }

  // Used by Coolify's health check.
  @Get('health')
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
