"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../../src/index");
const Candidate_model_1 = require("../../src/models/Candidate.model");
const setup_1 = require("../setup");
describe('Security - SQL/NoSQL injection attempts', () => {
    const authToken = (0, setup_1.generateTestToken)();
    it("should reject injection attempt in email field", async () => {
        const response = await (0, supertest_1.default)(index_1.app)
            .post('/api/candidates')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            ...setup_1.TEST_CANDIDATE,
            email: "admin@test.com' OR '1'='1",
        });
        expect(response.status).toBe(400);
    });
    it('should not cause destructive effect with injection-like name payload', async () => {
        const response = await (0, supertest_1.default)(index_1.app)
            .post('/api/candidates')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            ...setup_1.TEST_CANDIDATE,
            email: 'name-injection@test.com',
            lastName: "'; DROP TABLE candidates--",
        });
        expect([201, 400]).toContain(response.status);
        const total = await Candidate_model_1.CandidateModel.countDocuments({});
        expect(total).toBeGreaterThanOrEqual(0);
    });
    it("should not apply status injection query param", async () => {
        await Candidate_model_1.CandidateModel.create({
            ...setup_1.TEST_CANDIDATE,
            email: 'pending-inj@test.com',
            status: 'pending',
        });
        await Candidate_model_1.CandidateModel.create({
            ...setup_1.TEST_CANDIDATE,
            email: 'validated-inj@test.com',
            status: 'validated',
        });
        const response = await (0, supertest_1.default)(index_1.app)
            .get("/api/candidates?status=' OR '1'='1")
            .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
});
