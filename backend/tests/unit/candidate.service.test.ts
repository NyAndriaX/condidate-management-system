import mongoose from 'mongoose';

import { AppError } from '../../src/utils/AppError';
import { CandidateModel } from '../../src/models/Candidate.model';
import { candidateService } from '../../src/services/candidate.service';
import { TEST_CANDIDATE } from '../setup';

describe('CandidateService', () => {
  describe('create', () => {
    it('should create a valid candidate', async () => {
      const candidate = await candidateService.create({
        ...TEST_CANDIDATE,
        email: 'create.service@example.com',
      });

      expect(candidate._id).toBeDefined();
      expect(candidate.email).toBe('create.service@example.com');
      expect(candidate.status).toBe('pending');
      expect(candidate.isDeleted).toBe(false);
    });

    it('should throw an error for duplicate email', async () => {
      const duplicateEmail = 'duplicate.service@example.com';

      await candidateService.create({
        ...TEST_CANDIDATE,
        email: duplicateEmail,
      });

      await expect(
        candidateService.create({
          ...TEST_CANDIDATE,
          email: duplicateEmail,
        }),
      ).rejects.toMatchObject({
        message: 'Un candidat avec cet email existe deja.',
        statusCode: 409,
      });
    });
  });

  describe('findById', () => {
    it('should return an existing candidate', async () => {
      const created = await CandidateModel.create({
        ...TEST_CANDIDATE,
        email: 'findbyid.service@example.com',
      });

      const found = await candidateService.findById(created._id.toString());

      expect(found).not.toBeNull();
      expect(found?.email).toBe('findbyid.service@example.com');
    });

    it('should throw 404 when candidate does not exist', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      await expect(candidateService.findById(nonExistingId)).rejects.toMatchObject({
        message: 'Candidat non trouve.',
        statusCode: 404,
      });
    });
  });

  describe('update', () => {
    it('should update candidate successfully', async () => {
      const created = await CandidateModel.create({
        ...TEST_CANDIDATE,
        email: 'update.service@example.com',
      });

      const updated = await candidateService.update(created._id.toString(), {
        position: 'Tech Lead',
        experience: 8,
      });

      expect(updated.position).toBe('Tech Lead');
      expect(updated.experience).toBe(8);
    });

    it('should throw 404 when updating non-existing candidate', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      await expect(candidateService.update(nonExistingId, { position: 'Updated Role' })).rejects.toThrow(
        AppError,
      );
      await expect(
        candidateService.update(nonExistingId, {
          position: 'Updated Role',
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('softDelete', () => {
    it('should mark a candidate as deleted', async () => {
      const created = await CandidateModel.create({
        ...TEST_CANDIDATE,
        email: 'softdelete.service@example.com',
      });

      await candidateService.softDelete(created._id.toString());

      const deletedCandidate = await CandidateModel.findById(created._id).lean().exec();
      expect(deletedCandidate?.isDeleted).toBe(true);
      expect(deletedCandidate?.deletedAt).not.toBeNull();
    });

    it('should throw 404 when soft deleting non-existing candidate', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      await expect(candidateService.softDelete(nonExistingId)).rejects.toMatchObject({
        message: 'Candidat non trouve.',
        statusCode: 404,
      });
    });
  });

  describe('validate', () => {
    it('should wait 2 seconds and set status to validated', async () => {
      const created = await CandidateModel.create({
        ...TEST_CANDIDATE,
        email: 'validate.service@example.com',
      });

      const startTime = Date.now();
      const validated = await candidateService.validate(created._id.toString());
      const elapsedMs = Date.now() - startTime;

      expect(validated.status).toBe('validated');
      expect(elapsedMs).toBeGreaterThanOrEqual(1900);
    }, 10000);

    it('should throw 404 when validating non-existing candidate', async () => {
      const nonExistingId = new mongoose.Types.ObjectId().toString();

      await expect(candidateService.validate(nonExistingId)).rejects.toMatchObject({
        message: 'Candidat non trouve.',
        statusCode: 404,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const candidates = Array.from({ length: 12 }).map((_, index) => ({
        ...TEST_CANDIDATE,
        email: `pagination-${index}@example.com`,
      }));

      await CandidateModel.insertMany(candidates);

      const result = await candidateService.findAll({ page: 2, limit: 5 });

      expect(result.total).toBe(12);
      expect(result.pages).toBe(3);
      expect(result.candidates).toHaveLength(5);
    });

    it('should filter results by status', async () => {
      await CandidateModel.create({
        ...TEST_CANDIDATE,
        email: 'pending-status@example.com',
        status: 'pending',
      });

      await CandidateModel.create({
        ...TEST_CANDIDATE,
        email: 'validated-status@example.com',
        status: 'validated',
      });

      await CandidateModel.create({
        ...TEST_CANDIDATE,
        email: 'deleted-status@example.com',
        status: 'validated',
        isDeleted: true,
      });

      const result = await candidateService.findAll({ status: 'validated' });

      expect(result.total).toBe(1);
      expect(result.candidates).toHaveLength(1);
      expect(result.candidates[0].email).toBe('validated-status@example.com');
    });
  });
});
