import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect({ status: 'ok' });
  });

  it('refuses /me without a token', () => {
    return request(app.getHttpServer()).get('/me').expect(401);
  });

  it('refuses a bookmark without a token', () => {
    return request(app.getHttpServer()).put('/bookmarks/component/loader').expect(401);
  });

  it('refuses an unsigned webhook', () => {
    return request(app.getHttpServer()).post('/billing/webhook').send({ event_type: 'x' }).expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});
