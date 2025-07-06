const { MongoClient } = require('mongodb');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const { favouritesUser } = require('../config/mockData');

describe('Favourites', () => {
  let connection;
  let db;
  let token;
  let movieId;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    db = await connection.db(global.__MONGO_DB_NAME__);

    // Create user and get token
    const resCreatedUser = await request(app)
      .post('/api/auth/register')
      .send(favouritesUser);
    token = resCreatedUser.body.token;
  });

  afterAll(async () => {
    await connection.close();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Create a movie
    const resCreatedMovie = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('fake-image'), {
        filename: 'test-image.jpg',
        contentType: 'image/jpeg'
      })
      .field('title', 'Test Movie')
      .field('voteAverage', '7')
      .field('releaseYear', '2024')
      .field('description', 'A test movie description')
      .field('genre', 'Action');
    movieId = resCreatedMovie.body._id;
  })

  afterEach(async () => {
    await db.collection('favourites').deleteMany({});
    await db.collection('movies').deleteMany({});
    const bucket = new mongoose.mongo.GridFSBucket(db);
    const files = await bucket.find({}).toArray();
    await Promise.all(files.map(file => bucket.delete(file._id)));
    movieId = null;
  });

  describe('POST /api/favourites', () => {
    it('successfully add a favourite movie', async () => {
      const resFavouriteCreated = await request(app)
        .post('/api/favourites')
        .set('Authorization', `Bearer ${token}`)
        .send({ movieId: movieId });

      expect(resFavouriteCreated.statusCode).toBe(201);
      expect(resFavouriteCreated.body).toHaveProperty('_id');
    });
    it('fail to favourites 2 times the same movie', async () => {
      const firstRes = await request(app)
        .post('/api/favourites')
        .set('Authorization', `Bearer ${token}`)
        .send({ movieId: movieId });

      expect(firstRes.statusCode).toBe(201);

      const secondRes = await request(app)
        .post('/api/favourites')
        .set('Authorization', `Bearer ${token}`)
        .send({ movieId: movieId });

      expect(secondRes.statusCode).toBe(400);
    });
    it('movie does not exist', async () => {
      const resFavouriteCreated = await request(app)
        .post('/api/favourites')
        .set('Authorization', `Bearer ${token}`)
        .send({ movieId: "67868e9897ebaaf0c45aa26a" });

      expect(resFavouriteCreated.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/favourites/:movieId', () => {
    it('successfully deleted a favourite movie', async () => {
      // LIKE
      const firstRes = await request(app)
        .post('/api/favourites')
        .set('Authorization', `Bearer ${token}`)
        .send({ movieId: movieId });

      expect(firstRes.statusCode).toBe(201);

      const resFavouriteDeleted = await request(app)
        .delete(`/api/favourites/${movieId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(resFavouriteDeleted.statusCode).toBe(200);
    });
    it('error when nothing to delete', async () => {

      const resFavouriteDeleted = await request(app)
        .delete(`/api/favourites/${movieId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(resFavouriteDeleted.statusCode).toBe(404);
    });
  });

  describe('GET /api/favourites', () => {
    it('get all favourites', async () => {
      // LIKE
      const firstRes = await request(app)
        .post('/api/favourites')
        .set('Authorization', `Bearer ${token}`)
        .send({ movieId: movieId });

      expect(firstRes.statusCode).toBe(201);

      const resFavouriteAll = await request(app)
        .get(`/api/favourites`)
        .set('Authorization', `Bearer ${token}`)


      expect(resFavouriteAll.statusCode).toBe(200);
      expect(resFavouriteAll.body[0]).toHaveProperty('_id');
    });
  });

  describe('GET /api/favourites/count', () => {
    it('get all favourites', async () => {
      // LIKE
      const firstRes = await request(app)
        .post('/api/favourites')
        .set('Authorization', `Bearer ${token}`)
        .send({ movieId: movieId });

      expect(firstRes.statusCode).toBe(201);

      const resFavouriteAll = await request(app)
        .get(`/api/favourites/count`)
        .set('Authorization', `Bearer ${token}`)


      expect(resFavouriteAll.statusCode).toBe(200);
      expect(resFavouriteAll.body.count).toBe(1);
    });
  });

});