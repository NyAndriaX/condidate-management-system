import request from 'supertest';

import { app } from '../../src/index';
import { UserModel } from '../../src/models/User.model';
import { TEST_USER } from '../setup';

describe('Security - Brute force protection', () => {
  it('should block the 101st login request with 429', async () => {
    const email = 'bruteforce@test.com';
    await UserModel.create({
      email,
      password: TEST_USER.password,
      name: TEST_USER.name,
    });

    let lastResponse;
    for (let index = 0; index < 101; index += 1) {
      // Use invalid password to simulate brute-force attempts.
      // eslint-disable-next-line no-await-in-loop
      lastResponse = await request(app).post('/api/auth/login').send({
        email,
        password: `wrong-password-${index}`,
      });
    }

    expect(lastResponse?.status).toBe(429);
    expect(String(lastResponse?.text ?? '')).toContain('Trop de requetes');
  }, 30000);
});
