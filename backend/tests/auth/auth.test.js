const { MongoClient } = require('mongodb');
const request = require('supertest');
const app = require('../../app');
const { validUser } = require('../config/mockData');
const mongoose = require('mongoose');

describe('Auth register', () => {
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

  describe('POST /api/auth/register', () => {
    it('register successfully a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');

      const insertedUser = await db.collection('users').findOne({ email: validUser.email });
      expect(insertedUser.username).toBe(validUser.username);
    });
    it('should not register user with existing email', async () => {
      // First create a user
      const users = db.collection('users');
      await users.insertOne(validUser);

      // Try to create another user with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          username: 'different'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('User already exists');
      
      // Verify only one user exists
      const count = await users.countDocuments();
      expect(count).toBe(1);
    });

  });
  describe('POST /api/auth/login', () => {
    it('should login successufully', async () => {
      // First create a user
      const users = db.collection('users');
      await users.insertOne({
        username: validUser.username,
        email: validUser.email,
        password: validUser.hashedPassword,
      });

      // Try to create another user with same email
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: validUser.email,
            password: validUser.password
          });


        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('id');

        // Verify only one user exists
        const insertedUser = await db.collection('users').findOne({ email: validUser.email });
        expect(insertedUser.username).toBe(validUser.username);
    });
    it('Wrong passwords', async () => {
      // First create a user
      const users = db.collection('users');
      await users.insertOne({
        username: validUser.username,
        email: validUser.email,
        password: validUser.hashedPassword,
      });

        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: validUser.email,
            password: "Wrong!"
          });


        expect(res.statusCode).toBe(400);
    });
    it('User doesn\'t exist', async () => {

        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: validUser.email,
            password: validUser.password
          });


        expect(res.statusCode).toBe(400);
    });
  })
});