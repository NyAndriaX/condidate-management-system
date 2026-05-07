"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Candidate_model_1 = require("../../src/models/Candidate.model");
const setup_1 = require("../setup");
describe('CandidateModel', () => {
    it('should require mandatory fields', async () => {
        const candidate = new Candidate_model_1.CandidateModel({});
        await expect(candidate.validate()).rejects.toThrow();
    });
    it('should throw an error for invalid email', async () => {
        const candidate = new Candidate_model_1.CandidateModel({
            ...setup_1.TEST_CANDIDATE,
            email: 'invalid-email',
        });
        await expect(candidate.validate()).rejects.toThrow();
    });
    it('should throw an error for negative experience', async () => {
        const candidate = new Candidate_model_1.CandidateModel({
            ...setup_1.TEST_CANDIDATE,
            email: 'negative-experience@example.com',
            experience: -1,
        });
        await expect(candidate.validate()).rejects.toThrow();
    });
    it('should throw an error for invalid resume URL', async () => {
        const candidate = new Candidate_model_1.CandidateModel({
            ...setup_1.TEST_CANDIDATE,
            email: 'invalid-resume@example.com',
            resume: 'not-a-url',
        });
        await expect(candidate.validate()).rejects.toThrow();
    });
    it('should soft delete a candidate', async () => {
        const candidate = await Candidate_model_1.CandidateModel.create({
            ...setup_1.TEST_CANDIDATE,
            email: 'model-softdelete@example.com',
        });
        await candidate.softDelete();
        const updated = await Candidate_model_1.CandidateModel.findById(candidate._id).lean().exec();
        expect(updated?.isDeleted).toBe(true);
        expect(updated?.deletedAt).not.toBeNull();
    });
    it('should return only active candidates in findActive', async () => {
        const activeCandidate = await Candidate_model_1.CandidateModel.create({
            ...setup_1.TEST_CANDIDATE,
            email: 'active-model@example.com',
        });
        const deletedCandidate = await Candidate_model_1.CandidateModel.create({
            ...setup_1.TEST_CANDIDATE,
            email: 'deleted-model@example.com',
        });
        await deletedCandidate.softDelete();
        const results = await Candidate_model_1.CandidateModel.findActive();
        const resultIds = results.map((candidate) => candidate._id.toString());
        expect(resultIds).toContain(activeCandidate._id.toString());
        expect(resultIds).not.toContain(deletedCandidate._id.toString());
    });
    it('should throw cast error for invalid object id when querying', async () => {
        await expect(Candidate_model_1.CandidateModel.findById('invalid-id').exec()).rejects.toThrow(mongoose_1.default.Error.CastError);
    });
});
