const request = require('supertest');
const app = require('../../src/index');

describe('GET /health', () => {
  test('returns 200 and status: ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('version');
  });
});
