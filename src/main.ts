import './env.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { config } from './config.js';

async function bootstrap() {
  // rawBody: the Paddle webhook signature is checked against the exact bytes sent.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });
  app.enableShutdownHooks();

  // Bind to all interfaces so the container is reachable from Coolify's proxy.
  await app.listen(config.port, '0.0.0.0');
}
await bootstrap();
