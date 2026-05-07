import mongoose from 'mongoose';

import { CandidateModel } from '../../src/models/Candidate.model';
import { TEST_CANDIDATE } from '../setup';

describe('CandidateModel', () => {
  it('should require mandatory fields', async () => {
    const candidate = new CandidateModel({});

    await expect(candidate.validate()).rejects.toThrow();
  });

  it('should throw an error for invalid email', async () => {
    const candidate = new CandidateModel({
      ...TEST_CANDIDATE,
      email: 'invalid-email',
    });

    await expect(candidate.validate()).rejects.toThrow();
  });

  it('should throw an error for negative experience', async () => {
    const candidate = new CandidateModel({
      ...TEST_CANDIDATE,
      email: 'negative-experience@example.com',
      experience: -1,
    });

    await expect(candidate.validate()).rejects.toThrow();
  });

  it('should throw an error for invalid resume URL', async () => {
    const candidate = new CandidateModel({
      ...TEST_CANDIDATE,
      email: 'invalid-resume@example.com',
      resume: 'not-a-url',
    });

    await expect(candidate.validate()).rejects.toThrow();
  });

  it('should soft delete a candidate', async () => {
    const candidate = await CandidateModel.create({
      ...TEST_CANDIDATE,
      email: 'model-softdelete@example.com',
    });

    await candidate.softDelete();
    const updated = await CandidateModel.findById(candidate._id).lean().exec();

    expect(updated?.isDeleted).toBe(true);
    expect(updated?.deletedAt).not.toBeNull();
  });

  it('should return only active candidates in findActive', async () => {
    const activeCandidate = await CandidateModel.create({
      ...TEST_CANDIDATE,
      email: 'active-model@example.com',
    });

    const deletedCandidate = await CandidateModel.create({
      ...TEST_CANDIDATE,
      email: 'deleted-model@example.com',
    });

    await deletedCandidate.softDelete();

    const results = await CandidateModel.findActive();
    const resultIds = results.map((candidate) => candidate._id.toString());

    expect(resultIds).toContain(activeCandidate._id.toString());
    expect(resultIds).not.toContain(deletedCandidate._id.toString());
  });

  it('should throw cast error for invalid object id when querying', async () => {
    await expect(CandidateModel.findById('invalid-id').exec()).rejects.toThrow(mongoose.Error.CastError);
  });
});
