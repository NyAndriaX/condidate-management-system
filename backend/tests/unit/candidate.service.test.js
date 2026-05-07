"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = require("../../src/utils/AppError");
const Candidate_model_1 = require("../../src/models/Candidate.model");
const candidate_service_1 = require("../../src/services/candidate.service");
const setup_1 = require("../setup");
describe('CandidateService', () => {
    describe('create', () => {
        it('should create a valid candidate', async () => {
            const candidate = await candidate_service_1.candidateService.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'create.service@example.com',
            });
            expect(candidate._id).toBeDefined();
            expect(candidate.email).toBe('create.service@example.com');
            expect(candidate.status).toBe('pending');
            expect(candidate.isDeleted).toBe(false);
        });
        it('should throw an error for duplicate email', async () => {
            const duplicateEmail = 'duplicate.service@example.com';
            await candidate_service_1.candidateService.create({
                ...setup_1.TEST_CANDIDATE,
                email: duplicateEmail,
            });
            await expect(candidate_service_1.candidateService.create({
                ...setup_1.TEST_CANDIDATE,
                email: duplicateEmail,
            })).rejects.toMatchObject({
                message: 'Un candidat avec cet email existe deja.',
                statusCode: 409,
            });
        });
    });
    describe('findById', () => {
        it('should return an existing candidate', async () => {
            const created = await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'findbyid.service@example.com',
            });
            const found = await candidate_service_1.candidateService.findById(created._id.toString());
            expect(found).not.toBeNull();
            expect(found?.email).toBe('findbyid.service@example.com');
        });
        it('should throw 404 when candidate does not exist', async () => {
            const nonExistingId = new mongoose_1.default.Types.ObjectId().toString();
            await expect(candidate_service_1.candidateService.findById(nonExistingId)).rejects.toMatchObject({
                message: 'Candidat non trouve.',
                statusCode: 404,
            });
        });
    });
    describe('update', () => {
        it('should update candidate successfully', async () => {
            const created = await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'update.service@example.com',
            });
            const updated = await candidate_service_1.candidateService.update(created._id.toString(), {
                position: 'Tech Lead',
                experience: 8,
            });
            expect(updated.position).toBe('Tech Lead');
            expect(updated.experience).toBe(8);
        });
        it('should throw 404 when updating non-existing candidate', async () => {
            const nonExistingId = new mongoose_1.default.Types.ObjectId().toString();
            await expect(candidate_service_1.candidateService.update(nonExistingId, { position: 'Updated Role' })).rejects.toThrow(AppError_1.AppError);
            await expect(candidate_service_1.candidateService.update(nonExistingId, {
                position: 'Updated Role',
            })).rejects.toMatchObject({
                statusCode: 404,
            });
        });
    });
    describe('softDelete', () => {
        it('should mark a candidate as deleted', async () => {
            const created = await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'softdelete.service@example.com',
            });
            await candidate_service_1.candidateService.softDelete(created._id.toString());
            const deletedCandidate = await Candidate_model_1.CandidateModel.findById(created._id).lean().exec();
            expect(deletedCandidate?.isDeleted).toBe(true);
            expect(deletedCandidate?.deletedAt).not.toBeNull();
        });
        it('should throw 404 when soft deleting non-existing candidate', async () => {
            const nonExistingId = new mongoose_1.default.Types.ObjectId().toString();
            await expect(candidate_service_1.candidateService.softDelete(nonExistingId)).rejects.toMatchObject({
                message: 'Candidat non trouve.',
                statusCode: 404,
            });
        });
    });
    describe('validate', () => {
        it('should wait 2 seconds and set status to validated', async () => {
            const created = await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'validate.service@example.com',
            });
            const startTime = Date.now();
            const validated = await candidate_service_1.candidateService.validate(created._id.toString());
            const elapsedMs = Date.now() - startTime;
            expect(validated.status).toBe('validated');
            expect(elapsedMs).toBeGreaterThanOrEqual(1900);
        }, 10000);
        it('should throw 404 when validating non-existing candidate', async () => {
            const nonExistingId = new mongoose_1.default.Types.ObjectId().toString();
            await expect(candidate_service_1.candidateService.validate(nonExistingId)).rejects.toMatchObject({
                message: 'Candidat non trouve.',
                statusCode: 404,
            });
        });
    });
    describe('findAll', () => {
        it('should return paginated results', async () => {
            const candidates = Array.from({ length: 12 }).map((_, index) => ({
                ...setup_1.TEST_CANDIDATE,
                email: `pagination-${index}@example.com`,
            }));
            await Candidate_model_1.CandidateModel.insertMany(candidates);
            const result = await candidate_service_1.candidateService.findAll({ page: 2, limit: 5 });
            expect(result.total).toBe(12);
            expect(result.pages).toBe(3);
            expect(result.candidates).toHaveLength(5);
        });
        it('should filter results by status', async () => {
            await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'pending-status@example.com',
                status: 'pending',
            });
            await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'validated-status@example.com',
                status: 'validated',
            });
            await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'deleted-status@example.com',
                status: 'validated',
                isDeleted: true,
            });
            const result = await candidate_service_1.candidateService.findAll({ status: 'validated' });
            expect(result.total).toBe(1);
            expect(result.candidates).toHaveLength(1);
            expect(result.candidates[0].email).toBe('validated-status@example.com');
        });
    });
});
