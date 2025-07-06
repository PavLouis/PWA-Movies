const { MongoClient } = require('mongodb');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const { likeListUser, privateMockList, publicMockList } = require('../config/mockData');

jest.mock('../../utils/pushSubscription', () => ({
  sendPushNotification: jest.fn().mockResolvedValue({})
}));

describe('Like Controller', () => {
  let connection;
  let db;
  let token;
  let publicListId;
  let privateListId;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    db = await connection.db(global.__MONGO_DB_NAME__);
    const resCreatedUser = await request(app)
      .post('/api/auth/register')
      .send(likeListUser);
    token = resCreatedUser.body.token;

    const publicList = await request(app)
      .post('/api/lists')
      .set('Authorization', `Bearer ${token}`)
      .send(publicMockList);
    publicListId = publicList.body._id;

    const privateList = await request(app)
      .post('/api/lists')
      .set('Authorization', `Bearer ${token}`)
      .send(privateMockList);
    privateListId = privateList.body._id;
  });

  afterAll(async () => {
    await connection.close();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await db.collection('listlikes').deleteMany({});
  });

  describe('POST /api/like/:recMovieListId', () => {
    it('successfully toggles like status', async () => {
      const res = await request(app)
        .post(`/api/like/${publicListId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('liked', true);

      const res2 = await request(app)
        .post(`/api/like/${publicListId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res2.statusCode).toBe(200);
      expect(res2.body).toHaveProperty('liked', false);
    });

    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .post(`/api/like/${publicListId}`);
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/like/:recMovieListId', () => {
    it('returns correct like status', async () => {
      await request(app)
        .post(`/api/like/${publicListId}`)
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .get(`/api/like/${publicListId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('liked', true);
    });
  });

  describe('GET /api/like/:recMovieListId/count', () => {
    it('returns correct like count', async () => {
      await request(app)
        .post(`/api/like/${publicListId}`)
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .get(`/api/like/${publicListId}/count`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('count', 1);
    });
  });

  describe('GET /api/like/me/liked-lists', () => {
    it('returns only public liked lists', async () => {
      await request(app)
        .post(`/api/like/${publicListId}`)
        .set('Authorization', `Bearer ${token}`);
      await request(app)
        .post(`/api/like/${privateListId}`)
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .get('/api/like/me/liked-lists')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].list._id).toBe(publicListId);
    });
  });
});