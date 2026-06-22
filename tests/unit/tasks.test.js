jest.mock('../../src/models/Task', () => ({
  find: jest.fn(),
  create: jest.fn(),
}));

const request = require('supertest');
const Task = require('../../src/models/Task');
const app = require('../../src/index');

describe('Tasks routes (unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/tasks with empty title returns 400', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '' });
    expect(res.status).toBe(400);
    expect(Task.create).not.toHaveBeenCalled();
  });

  test('POST /api/tasks without title returns 400', async () => {
    const res = await request(app).post('/api/tasks').send({});
    expect(res.status).toBe(400);
    expect(Task.create).not.toHaveBeenCalled();
  });

  test('GET /api/tasks returns an array (even empty)', async () => {
    Task.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toEqual([]);
  });
});
