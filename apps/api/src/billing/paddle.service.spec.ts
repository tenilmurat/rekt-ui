import { createHmac } from 'node:crypto';

const SECRET = 'pdl_ntfset_test_secret';
process.env.PADDLE_WEBHOOK_SECRET = SECRET;
const { PaddleService } = await import('./paddle.service.js');

const sign = (body: string, ts = Math.floor(Date.now() / 1000)) =>
  `ts=${ts};h1=${createHmac('sha256', SECRET).update(`${ts}:${body}`).digest('hex')}`;

describe('PaddleService.verifyWebhook', () => {
  const paddle = new PaddleService();
  const body = '{"event_type":"subscription.created"}';

  it('accepts a correctly signed body', () => {
    expect(paddle.verifyWebhook(body, sign(body))).toBe(true);
  });

  it('rejects a changed body', () => {
    expect(paddle.verifyWebhook(`${body} `, sign(body))).toBe(false);
  });

  it('rejects an old signature', () => {
    const old = Math.floor(Date.now() / 1000) - 600;
    expect(paddle.verifyWebhook(body, sign(body, old))).toBe(false);
  });

  it('rejects a missing header', () => {
    expect(paddle.verifyWebhook(body, undefined)).toBe(false);
  });
});
