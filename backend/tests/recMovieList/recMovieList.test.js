const { MongoClient } = require('mongodb');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const { recMovieListUser, privateMockList, publicMockList } = require('../config/mockData');

describe('Movie Lists', () => {
  let connection;
  let db;
  let token;
  let listId;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    db = await connection.db(global.__MONGO_DB_NAME__);
    const resCreatedUser = await request(app)
      .post('/api/auth/register')
      .send(recMovieListUser);
    token = resCreatedUser.body.token;
  });

  afterAll(async () => {
    await connection.close();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await db.collection('recmovielists').deleteMany({});
    await db.collection('listmovies').deleteMany({});
    listId = null;
  });

  describe('POST /api/lists', () => {
    it('successfully creates a list', async () => {
      const res = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(publicMockList);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', publicMockList.title);
    });

    it('successfully create list with isPublic false', async () => {
      const res = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(privateMockList);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.isPublic).toBe(false);
    });

    it('fails without title', async () => {
      const res = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'test' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/lists/all', () => {
    it('successfully fetches public lists', async () => {
      // Create a public list first
      const createRes = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(publicMockList);

      const res = await request(app)
        .get('/api/lists/all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty('title', publicMockList.title);
    });

    it('only returns public lists', async () => {
      // Create both public and private lists
      await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(publicMockList);

      await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(privateMockList);

      const res = await request(app)
        .get('/api/lists/all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('GET /api/lists/self', () => {
    it('successfully fetches user lists', async () => {
      // Create a list for the user
      const createRes = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(publicMockList);

      const res = await request(app)
        .get('/api/lists/self')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty('title', publicMockList.title);
    });

    it('returns only user\'s lists', async () => {
      // Create a list for the current user
      await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(publicMockList);

      // Create another user and their list
      const anotherUser = await request(app)
        .post('/api/auth/register')
        .send({ ...recMovieListUser, email: 'another@test.com', username: 'another' });

      await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${anotherUser.body.token}`)
        .send(publicMockList);

      const res = await request(app)
        .get('/api/lists/self')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('GET /api/lists/:id', () => {
    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(privateMockList);
      listId = createRes.body._id;
    });

    it('successfully fetches a list', async () => {
      const res = await request(app)
        .get(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', listId);
      expect(res.body).toHaveProperty('movies');
    });

    it('fails with invalid id', async () => {
      const res = await request(app)
        .get('/api/lists/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });

    it('fails for private list of another user', async () => {
      const anotherUser = await request(app)
        .post('/api/auth/register')
        .send({ ...recMovieListUser, email: 'yahou@test.com', username: 'another64' });

      const res = await request(app)
        .get(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${anotherUser.body.token}`);

      expect(res.statusCode).toBe(403);
    });

    it('success for public list of another user', async () => {
      const createResFirstUser = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(publicMockList);
      const tmpListId = createResFirstUser.body._id;

      const anotherUser = await request(app)
        .post('/api/auth/register')
        .send({ ...recMovieListUser, email: 'yahouSecond@test.com', username: 'anotherSecond64' });

      const res = await request(app)
        .get(`/api/lists/${tmpListId}`)
        .set('Authorization', `Bearer ${anotherUser.body.token}`);

      expect(res.statusCode).toBe(200);
    });
  });


  describe('PUT /api/lists/:id', () => {
    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(privateMockList);
      listId = createRes.body._id;
    });

    it('successfully updates a list', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated Description',
        isPublic: true
      };

      const res = await request(app)
        .put(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', updates.title);
      expect(res.body).toHaveProperty('description', updates.description);
      expect(res.body).toHaveProperty('isPublic', updates.isPublic);
    });

    it('fails with invalid id', async () => {
      const res = await request(app)
        .put('/api/lists/invalid-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });

      expect(res.statusCode).toBe(400);
    });

    it('fails for another user\'s list', async () => {
      const anotherUser = await request(app)
        .post('/api/auth/register')
        .send({ ...recMovieListUser, email: 'myaman@test.com', username: 'bigAAA' });

      const res = await request(app)
        .put(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${anotherUser.body.token}`)
        .send({ title: 'Updated' });

      expect(res.statusCode).toBe(403);
    });

    it('fails when list doesn\'t exit', async () => {
      const res = await request(app)
        .put(`/api/lists/67868aefd6399ec6422e11aa`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("List not found");
    });
  });

  describe('DELETE /api/lists/:id', () => {
    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(publicMockList);
      listId = createRes.body._id;
    });

    it('successfully deletes a list', async () => {
      const res = await request(app)
        .delete(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(204);

      const checkList = await request(app)
        .get(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(checkList.statusCode).toBe(404);
    });

    it('fails with invalid id', async () => {
      const res = await request(app)
        .delete('/api/lists/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });

    it('fails for another user\'s list', async () => {
      const anotherUser = await request(app)
        .post('/api/auth/register')
        .send({ ...recMovieListUser, email: 'zaeazezaeaze@test.com', username: 'eazeaezaze' });

      const res = await request(app)
        .delete(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${anotherUser.body.token}`);

      expect(res.statusCode).toBe(403);
    });
    it('fails when list doesn\'t exit', async () => {
      const res = await request(app)
        .delete(`/api/lists/67868aefd6399ec6422e11aa`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("List not found");
    });
  });
  describe('Movie List Operations', () => {
    let movieId;

    beforeEach(async () => {
      // Create a movie first
      const movieRes = await request(app)
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
      movieId = movieRes.body._id;

      // Create a list
      const listRes = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${token}`)
        .send(publicMockList);
      listId = listRes.body._id;
    });

    describe('POST /api/lists/:id/movies', () => {
      it('successfully adds movie to list', async () => {
        const res = await request(app)
          .post(`/api/lists/${listId}/movies`)
          .set('Authorization', `Bearer ${token}`)
          .send({ movieId });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('msg', 'Movied added to the list !');
      });

      it('fails with invalid list ID', async () => {
        const res = await request(app)
          .post('/api/lists/invalid-id/movies')
          .set('Authorization', `Bearer ${token}`)
          .send({ movieId });

        expect(res.statusCode).toBe(400);
      });

      it('prevents duplicate movies', async () => {
        await request(app)
          .post(`/api/lists/${listId}/movies`)
          .set('Authorization', `Bearer ${token}`)
          .send({ movieId });

        const res = await request(app)
          .post(`/api/lists/${listId}/movies`)
          .set('Authorization', `Bearer ${token}`)
          .send({ movieId });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Movie already in list');
      });

      it('fail to access list that does not exist', async () => {
        const res = await request(app)
          .post(`/api/lists/67868aefd6399ec6422e11aa/movies`)
          .set('Authorization', `Bearer ${token}`)
          .send({ movieId });

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'List not found');
      });

      it('fails to add movie to list of another user', async () => {
        const anotherUser = await request(app)
          .post('/api/auth/register')
          .send({ ...recMovieListUser, email: 'ratot@test.com', username: 'rat64' });
          
          
          const res = await request(app)
          .post(`/api/lists/${listId}/movies`)
          .set('Authorization', `Bearer ${anotherUser.body.token}`)
          .send({ movieId });
  
        expect(res.statusCode).toBe(403);
      });
    });

    describe('DELETE /api/lists/:id/movies/:movieId', () => {
      beforeEach(async () => {
        await request(app)
          .post(`/api/lists/${listId}/movies`)
          .set('Authorization', `Bearer ${token}`)
          .send({ movieId });
      });

      it('successfully removes movie from list', async () => {
        const res = await request(app)
          .delete(`/api/lists/${listId}/movies/${movieId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(204);
      });

      it('fails with invalid movie ID', async () => {
        const res = await request(app)
          .delete(`/api/lists/${listId}/movies/invalid-id`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
      });

      it('fails for non-existent movie in list', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app)
          .delete(`/api/lists/${listId}/movies/${nonExistentId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
      });

      it('fail to delete movie from list that does not exist', async () => {
        const res = await request(app)
          .delete(`/api/lists/67868aefd6399ec6422e11aa/movies/${movieId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ movieId });

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'List not found');
      });

      it('fails to add movie to list of another user', async () => {
        const anotherUser = await request(app)
          .post('/api/auth/register')
          .send({ ...recMovieListUser, email: 'ratdazdazot@test.com', username: 'radazdzat64' });
          
          
          const res = await request(app)
          .delete(`/api/lists/${listId}/movies/${movieId}`)
          .set('Authorization', `Bearer ${anotherUser.body.token}`)
          .send({ movieId });
  
        expect(res.statusCode).toBe(403);
      });
    });
  });
});