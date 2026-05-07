import request from 'supertest';

import { app } from '../../src/index';
import { UserModel } from '../../src/models/User.model';
import { TEST_USER } from '../setup';

describe('Auth Routes Integration', () => {
  describe('POST /api/auth/register', () => {
    it('should register with valid data and return token', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'register-valid@example.com',
        password: TEST_USER.password,
        name: TEST_USER.name,
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('register-valid@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 409 when email is duplicate', async () => {
      const duplicateEmail = 'register-duplicate@example.com';
      await UserModel.create({
        email: duplicateEmail,
        password: TEST_USER.password,
        name: TEST_USER.name,
      });

      const response = await request(app).post('/api/auth/register').send({
        email: duplicateEmail,
        password: TEST_USER.password,
        name: TEST_USER.name,
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 with invalid payload', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: '123',
        name: '',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await UserModel.create({
        email: 'login-valid@example.com',
        password: TEST_USER.password,
        name: TEST_USER.name,
      });
    });

    it('should login with valid credentials and return token', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login-valid@example.com',
        password: TEST_USER.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('login-valid@example.com');
    });

    it('should return 401 with invalid email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'not-found@example.com',
        password: TEST_USER.password,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'login-valid@example.com',
        password: 'wrong-password',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
