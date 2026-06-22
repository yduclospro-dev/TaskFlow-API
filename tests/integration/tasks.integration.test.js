const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Clear the require cache to ensure fresh module load
  delete require.cache[require.resolve('../../src/index')];
  app = require('../../src/index');
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

describe('Tasks API (integration)', () => {
  test('creates a task then retrieves it by id', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Write report', description: 'Pipeline report' });

    expect(created.status).toBe(201);
    expect(created.body).toHaveProperty('_id');
    expect(created.body.title).toBe('Write report');
    expect(created.body.description).toBe('Pipeline report');

    const id = created.body._id;

    const fetched = await request(app).get(`/api/tasks/${id}`);

    expect(fetched.status).toBe(200);
    expect(fetched.body._id).toBe(id);
    expect(fetched.body.title).toBe('Write report');
    expect(fetched.body.description).toBe('Pipeline report');
  });
});
