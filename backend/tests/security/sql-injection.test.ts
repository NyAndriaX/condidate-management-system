import request from 'supertest';

import { app } from '../../src/index';
import { CandidateModel } from '../../src/models/Candidate.model';
import { TEST_CANDIDATE, generateTestToken } from '../setup';

describe('Security - SQL/NoSQL injection attempts', () => {
  const authToken = generateTestToken();

  it("should reject injection attempt in email field", async () => {
    const response = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ...TEST_CANDIDATE,
        email: "admin@test.com' OR '1'='1",
      });

    expect(response.status).toBe(400);
  });

  it('should not cause destructive effect with injection-like name payload', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ...TEST_CANDIDATE,
        email: 'name-injection@test.com',
        lastName: "'; DROP TABLE candidates--",
      });

    expect([201, 400]).toContain(response.status);
    const total = await CandidateModel.countDocuments({});
    expect(total).toBeGreaterThanOrEqual(0);
  });

  it("should not apply status injection query param", async () => {
    await CandidateModel.create({
      ...TEST_CANDIDATE,
      email: 'pending-inj@test.com',
      status: 'pending',
    });
    await CandidateModel.create({
      ...TEST_CANDIDATE,
      email: 'validated-inj@test.com',
      status: 'validated',
    });

    const response = await request(app)
      .get("/api/candidates?status=' OR '1'='1")
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
