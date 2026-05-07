import request from 'supertest';

import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('Security - XSS protection', () => {
  const authToken = generateTestToken();

  it('should reject XSS payload in firstName', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: "<script>alert('XSS')</script>",
        lastName: 'Doe',
        email: 'xss-firstname@test.com',
        phone: '+261340000000',
        position: 'Developpeur Full Stack',
        experience: 5,
        skills: ['JavaScript'],
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should reject XSS payload in skills', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'xss-skills@test.com',
        phone: '+261340000000',
        position: 'Developpeur Full Stack',
        experience: 5,
        skills: ["<img src=x onerror=alert('XSS')>"],
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
