import jwt from 'jsonwebtoken';
import request from 'supertest';

import { app } from '../../src/index';
import { generateTestToken } from '../setup';

describe('Security - JWT protection', () => {
  it('should reject expired JWT with 401', async () => {
    const expiredToken = jwt.sign({ userId: 'expired-user' }, process.env.JWT_SECRET as string, {
      expiresIn: '-1s',
    });

    const response = await request(app)
      .get('/api/candidates')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
  });

  it('should reject tampered JWT payload with 401', async () => {
    const validToken = generateTestToken({ userId: 'payload-user' });
    const tokenParts = validToken.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({
        userId: 'attacker',
        role: 'admin',
      }),
      'utf8',
    )
      .toString('base64url')
      .replace(/=/g, '');
    const tamperedToken = `${tokenParts[0]}.${tamperedPayload}.${tokenParts[2]}`;

    const response = await request(app)
      .get('/api/candidates')
      .set('Authorization', `Bearer ${tamperedToken}`);

    expect(response.status).toBe(401);
  });

  it('should reject JWT signed with wrong secret with 401', async () => {
    const wrongSignedToken = jwt.sign({ userId: 'wrong-signature-user' }, 'wrong-secret', {
      expiresIn: '1h',
    });

    const response = await request(app)
      .get('/api/candidates')
      .set('Authorization', `Bearer ${wrongSignedToken}`);

    expect(response.status).toBe(401);
  });

  it('should reject access without token with 401', async () => {
    const response = await request(app).get('/api/candidates');
    expect(response.status).toBe(401);
  });
});
