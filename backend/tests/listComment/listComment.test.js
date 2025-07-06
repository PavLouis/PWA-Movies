const { MongoClient } = require('mongodb');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

jest.mock('../../utils/pushSubscription', () => ({
    sendPushNotification: jest.fn().mockResolvedValue({})
  }));
  

// Mock data
const mockUser = {
    username: 'dazdaz',
    email: 'tedazdazdazdazdst@example.com',
    password: 'password123'
};

const mockList = {
    title: 'Test Movie List',
    description: 'Test Description',
    isPrivate: false,
    movies: [
        {
            title: 'Test Movie',
            tmdbId: '123',
            posterPath: '/test.jpg'
        }
    ]
};

const mockComment = {
    content: 'This is a test comment'
};

describe('Comment Controller', () => {
    let connection;
    let db;
    let token;
    let listId;
    let commentId;

    beforeAll(async () => {
        connection = await MongoClient.connect(global.__MONGO_URI__);
        db = await connection.db(global.__MONGO_DB_NAME__);

        // Create test user and get token
        const resCreatedUser = await request(app)
            .post('/api/auth/register')
            .send(mockUser);
        token = resCreatedUser.body.token;

        // Create test list
        const list = await request(app)
            .post('/api/lists')
            .set('Authorization', `Bearer ${token}`)
            .send(mockList);
        listId = list.body._id;
    });

    afterAll(async () => {
        await connection.close();
        await mongoose.disconnect();
    });

    afterEach(async () => {
        await db.collection('listcomments').deleteMany({});
    });

    describe('POST /api/comment/:recMovieListId', () => {
        it('successfully creates a comment', async () => {
            const res = await request(app)
                .post(`/api/comment/${listId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(mockComment);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('content', mockComment.content);
            expect(res.body).toHaveProperty('userId');
            expect(res.body).toHaveProperty('recMovieListId');
        });

        it('returns 400 with empty comment content', async () => {
            const res = await request(app)
                .post(`/api/comment/${listId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: '' });

            expect(res.statusCode).toBe(400);
        });

        it('returns 401 without auth token', async () => {
            const res = await request(app)
                .post(`/api/comment/${listId}`)
                .send(mockComment);

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/comment/:recMovieListId', () => {
        beforeEach(async () => {
            // Create a test comment
            const comment = await request(app)
                .post(`/api/comment/${listId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(mockComment);
            commentId = comment.body._id;
        });

        it('successfully retrieves comments', async () => {
            const res = await request(app)
                .get(`/api/comment/${listId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('comments');
            expect(res.body.comments).toHaveLength(1);
            expect(res.body).toHaveProperty('totalComments', 1);
        });

        it('supports pagination', async () => {
            // Create additional comments
            await Promise.all([
                request(app)
                    .post(`/api/comment/${listId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({ content: 'Comment 2' }),
                request(app)
                    .post(`/api/comment/${listId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send({ content: 'Comment 3' })
            ]);

            const res = await request(app)
                .get(`/api/comment/${listId}?page=1&limit=2`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.comments).toHaveLength(2);
            expect(res.body).toHaveProperty('totalComments', 3);
            expect(res.body).toHaveProperty('totalPages', 2);
        });
    });

    describe('PUT /api/comment/:recMovieListId/comments/:commentId', () => {
        beforeEach(async () => {
            // Create a test comment
            const comment = await request(app)
                .post(`/api/comment/${listId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(mockComment);
            commentId = comment.body._id;
        });

        it('successfully updates a comment', async () => {
            const updatedContent = 'Updated comment content';
            const res = await request(app)
                .put(`/api/comment/${listId}/comments/${commentId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: updatedContent });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('content', updatedContent);
        });

        it('returns 404 for non-existent comment', async () => {
            const fakeCommentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/api/comment/${listId}/comments/${fakeCommentId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Updated content' });

            expect(res.statusCode).toBe(404);
        });

        it('returns 400 with empty content', async () => {
            const res = await request(app)
                .put(`/api/comment/${listId}/comments/${commentId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: '' });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('DELETE /api/comment/:recMovieListId/comments/:commentId', () => {
        beforeEach(async () => {
            // Create a test comment
            const comment = await request(app)
                .post(`/api/comment/${listId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(mockComment);
            commentId = comment.body._id;
        });

        it('successfully deletes a comment', async () => {
            const res = await request(app)
                .delete(`/api/comment/${listId}/comments/${commentId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Comment deleted successfully');

            // Verify comment is deleted
            const checkRes = await request(app)
                .get(`/api/comment/${listId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(checkRes.body.totalComments).toBe(0);
        });

        it('returns 404 for non-existent comment', async () => {
            const fakeCommentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/comment/${listId}/comments/${fakeCommentId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
        });

        it('returns 401 without auth token', async () => {
            const res = await request(app)
                .delete(`/api/comment/${listId}/comments/${commentId}`);

            expect(res.statusCode).toBe(401);
        });
    });
});