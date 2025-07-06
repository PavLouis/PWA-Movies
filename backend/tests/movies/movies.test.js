const { MongoClient } = require('mongodb');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const { movieUser } = require('../config/mockData');
const fs = require('fs');
const path = require('path');

jest.mock('../../utils/pushSubscription', () => ({
  sendPushNotificationToAll: jest.fn().mockResolvedValue({})

}));

describe('Movies', () => {
  let connection;
  let db;
  let token;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    db = await connection.db(global.__MONGO_DB_NAME__);
    
    // Create user and get token
    const resCreatedUser = await request(app)
      .post('/api/auth/register')
      .send(movieUser);
    token = resCreatedUser.body.token;
  });

  afterAll(async () => {
    await connection.close();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await db.collection('movies').deleteMany({});
    const bucket = new mongoose.mongo.GridFSBucket(db);
    const files = await bucket.find({}).toArray();
    await Promise.all(files.map(file => bucket.delete(file._id)));
  });

  describe('POST /api/movies', () => {
    it('successfully uploads a movie with image', async () => {
      const res = await request(app)
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

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe('Test Movie');
    });

    it('fails without authentication', async () => {
      const res = await request(app)
        .post('/api/movies')
        .attach('image', Buffer.from('fake-image'), {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg'
        })
        .field('title', 'Test Movie')
        .field('voteAverage', '7')
        .field('releaseYear', '2024')
        .field('description', 'A test movie description')
        .field('genre', 'Action');

      expect(res.statusCode).toBe(401);
    });

    it('fails when title not provided', async () => {
        const res = await request(app)
          .post('/api/movies')
          .set('Authorization', `Bearer ${token}`)
          .attach('image', Buffer.from('fake-image'), {
            filename: 'test-image.jpg',
            contentType: 'image/jpeg'
          })
          .field('releaseYear', '2024')
          .field('description', 'A test movie description')
          .field('genre', 'Action');
  
        expect(res.statusCode).toBe(400);
      });

    it('fails when image is not provided', async () => {
      const res = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${token}`)
        .field('title', 'Test Movie')
        .field('voteAverage', '7')
        .field('releaseYear', '2024')
        .field('description', 'A test movie description')
        .field('genre', 'Action');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Image is required');
    });
  });

  describe('GET /api/movies', () => {
    it('gets all movies with authentication', async () => {
      // First upload a movie
      await request(app)
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

      const res = await request(app)
        .get('/api/movies')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.movies)).toBeTruthy();
      expect(res.body.movies.length).toBe(1);
    });
  });

  describe('GET /api/movies/:id/image', () => {
    it('successfully retrieves movie image with authentication', async () => {
      const imagePath = path.join(__dirname, 'fixtures', 'test-image.PNG');
      const imageBuffer = fs.readFileSync(imagePath);
      
      const uploadRes = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', imageBuffer, {
          filename: 'test-image.PNG',
          contentType: 'image/png'
        })
        .field('title', 'Test Movie')
        .field('voteAverage', '7')
        .field('releaseYear', '2024')
        .field('description', 'A test movie description')
        .field('genre', 'Action');
    
      const res = await request(app)
        .get(`/api/movies/${uploadRes.body._id}/image`)
        .set('Authorization', `Bearer ${token}`);
    
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('image/webp');
    });
    
    it('image does not exist', async () => {  
        const res = await request(app)
          .get(`/api/movies/65f1a1234567890123456789/image`)
          .set('Authorization', `Bearer ${token}`);
  
        expect(res.statusCode).toBe(404);
      });
  });

  describe('DELETE /api/movies/:id', () => {
    it('successfully deletes with authentication', async () => {
      const uploadRes = await request(app)
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

      const res = await request(app)
        .delete(`/api/movies/${uploadRes.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Movie and image deleted successfully');
    });

    it('fails if movie don\'t exist', async () => {
      const res = await request(app)
      .delete('/api/movies/65f1a1234567890123456789')
      .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/movies/:id', () => {
    it('gets a single movie by id', async () => {
      const uploadRes = await request(app)
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

      const movieId = uploadRes.body._id;

      const res = await request(app)
        .get(`/api/movies/${movieId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.movie.title).toBe('Test Movie');
      expect(res.body.movie._id).toBe(movieId);
    });

    it('returns 404 for non-existent movie', async () => {
      const res = await request(app)
        .get('/api/movies/5f7d3a2b1c9d8b4a3c2e1f0a')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

});