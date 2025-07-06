const { MongoClient } = require('mongodb');
const request = require('supertest');
const app = require('../../app');
const { exempleUser, userMock1 } = require('../config/mockData');
const mongoose = require('mongoose');

describe('Users', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__);
    db = await connection.db(global.__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.close();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await db.collection('users').deleteMany({});
  });

  describe('GET /api/users/profile', () => {
    it('get self informations', async () => {
        // Create user
        const resCreatedUser = await request(app)
          .post('/api/auth/register')
          .send(exempleUser);
        
          expect(resCreatedUser.statusCode).toBe(201);

      
        const token = resCreatedUser.body.token;
        
        const res = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)  // Add token
          .send(exempleUser);
      
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id')
      });
  });

  describe('PUT /api/users/profile', () => {
    it('updates informations', async () => {
        // Create user
        const resCreatedUser = await request(app)
          .post('/api/auth/register')
          .send(exempleUser);

        expect(resCreatedUser.statusCode).toBe(201);
      
        const token = resCreatedUser.body.token;
        
        const res = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)  // Add token
          .send({
            email: "new@mail.com"
          });
      
          expect(res.status).toBe(200);
          expect(res.body.user.email).toBe('new@mail.com');
          expect(res.body.message).toBe('Profile updated successfully');
      });
      it('Update successufully new password', async () => {
        // Create user
        const resCreatedUser = await request(app)
          .post('/api/auth/register')
          .send(exempleUser);

        expect(resCreatedUser.statusCode).toBe(201);
      
        const token = resCreatedUser.body.token;
        
        const res = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)  // Add token
          .send({
            currentPassword: exempleUser.password,
            newPassword: userMock1.password
          });
      
          expect(res.status).toBe(200);
      });
      it('error in the email', async () => {
        // Create user
        const resCreatedUser = await request(app)
          .post('/api/auth/register')
          .send(exempleUser);

        expect(resCreatedUser.statusCode).toBe(201);
      
        const token = resCreatedUser.body.token;
        
        const res = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)  // Add token
          .send({
            email: "@mail.com"
          });
      
          expect(res.status).toBe(400);
      });
      it('error in the username', async () => {
        // Create user
        const resCreatedUser = await request(app)
          .post('/api/auth/register')
          .send(exempleUser);

        expect(resCreatedUser.statusCode).toBe(201);
      
        const token = resCreatedUser.body.token;
        
        const res = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)  // Add token
          .send({
            username: "Dgdgzgatydhaznidgyzaygduoazidéçèç_é&@@@"
          });
      
          expect(res.status).toBe(400);
      });
      it('error in the password', async () => {
        // Create user
        const resCreatedUser = await request(app)
          .post('/api/auth/register')
          .send(exempleUser);

        expect(resCreatedUser.statusCode).toBe(201);
      
        const token = resCreatedUser.body.token;
        
        const res = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)  // Add token
          .send({
            currentPassword: exempleUser.password,
            newPassword: "dzad"
          });
      
          expect(res.status).toBe(400);
      });
      it('new email already exist', async () => {
        // Create first account
        const users = db.collection('users');
        await users.insertOne(userMock1);


        // Create second user
        const resCreatedUser = await request(app)
          .post('/api/auth/register')
          .send(exempleUser);

        expect(resCreatedUser.statusCode).toBe(201);
      
        const token = resCreatedUser.body.token;
        
        // Try to change email to another one that exist already
        const res = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)  // Add token
          .send({
            email: userMock1.email
          });
      
          expect(res.status).toBe(400);
      });
      it('new username already exist', async () => {
        // Create first account
        const users = db.collection('users');
        await users.insertOne(userMock1);


        // Create second user
        const resCreatedUser = await request(app)
          .post('/api/auth/register')
          .send(exempleUser);

        expect(resCreatedUser.statusCode).toBe(201);
      
        const token = resCreatedUser.body.token;
        
        // Try to change username to another one that exist already
        const res = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)  // Add token
          .send({
            username: userMock1.username
          });
      
          expect(res.status).toBe(400);
      });
      it('wrong current password', async () => {
        // Create user
        const resCreatedUser = await request(app)
          .post('/api/auth/register')
          .send(exempleUser);

        expect(resCreatedUser.statusCode).toBe(201);
      
        const token = resCreatedUser.body.token;
        
        const res = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)  // Add token
          .send({
            currentPassword: "dedede",
            newPassword: userMock1.password
          });
      
          expect(res.status).toBe(400);
      });
  });

});