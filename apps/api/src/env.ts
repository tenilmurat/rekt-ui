import { existsSync } from 'node:fs';

// Local development reads .env; in Coolify the variables come from the environment.
// Imported first in main.ts so the values exist before config.ts reads them.
if (existsSync('.env')) process.loadEnvFile('.env');
