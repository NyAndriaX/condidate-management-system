"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../../src/index");
const Candidate_model_1 = require("../../src/models/Candidate.model");
const setup_1 = require("../setup");
describe('Candidate Routes Integration', () => {
    const authToken = (0, setup_1.generateTestToken)();
    const authHeader = { Authorization: `Bearer ${authToken}` };
    describe('POST /api/candidates', () => {
        it('should create candidate with valid data and auth', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/api/candidates')
                .set(authHeader)
                .send({ ...setup_1.TEST_CANDIDATE, email: 'post-valid@example.com' });
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('post-valid@example.com');
        });
        it('should return 401 without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/api/candidates')
                .send({ ...setup_1.TEST_CANDIDATE, email: 'post-no-auth@example.com' });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
        it('should return 400 with invalid data', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/api/candidates')
                .set(authHeader)
                .send({ ...setup_1.TEST_CANDIDATE, email: 'invalid-email' });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(Array.isArray(response.body.errors)).toBe(true);
        });
        it('should return 409 with duplicate email', async () => {
            const duplicateEmail = 'duplicate-route@example.com';
            await Candidate_model_1.CandidateModel.create({ ...setup_1.TEST_CANDIDATE, email: duplicateEmail });
            const response = await (0, supertest_1.default)(index_1.app)
                .post('/api/candidates')
                .set(authHeader)
                .send({ ...setup_1.TEST_CANDIDATE, email: duplicateEmail });
            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/candidates/:id', () => {
        it('should return existing candidate', async () => {
            const candidate = await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'get-existing@example.com',
            });
            const response = await (0, supertest_1.default)(index_1.app)
                .get(`/api/candidates/${candidate._id.toString()}`)
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('get-existing@example.com');
        });
        it('should return 404 for non-existing candidate', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .get('/api/candidates/507f1f77bcf86cd799439011')
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
        it('should return 401 without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.app).get('/api/candidates/507f1f77bcf86cd799439011');
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('PUT /api/candidates/:id', () => {
        it('should update candidate with valid payload', async () => {
            const candidate = await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'put-valid@example.com',
            });
            const response = await (0, supertest_1.default)(index_1.app)
                .put(`/api/candidates/${candidate._id.toString()}`)
                .set(authHeader)
                .send({ position: 'Principal Engineer', experience: 9 });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.position).toBe('Principal Engineer');
            expect(response.body.data.experience).toBe(9);
        });
        it('should return 401 without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .put('/api/candidates/507f1f77bcf86cd799439011')
                .send({ position: 'Updated' });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
        it('should return 400 with invalid update payload', async () => {
            const candidate = await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'put-invalid@example.com',
            });
            const response = await (0, supertest_1.default)(index_1.app)
                .put(`/api/candidates/${candidate._id.toString()}`)
                .set(authHeader)
                .send({ experience: -2 });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for non-existing candidate', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .put('/api/candidates/507f1f77bcf86cd799439011')
                .set(authHeader)
                .send({ position: 'Updated' });
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
    describe('DELETE /api/candidates/:id', () => {
        it('should soft delete candidate successfully', async () => {
            const candidate = await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'delete-valid@example.com',
            });
            const response = await (0, supertest_1.default)(index_1.app)
                .delete(`/api/candidates/${candidate._id.toString()}`)
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            const deletedCandidate = await Candidate_model_1.CandidateModel.findById(candidate._id).lean().exec();
            expect(deletedCandidate?.isDeleted).toBe(true);
        });
        it('should return 401 without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.app).delete('/api/candidates/507f1f77bcf86cd799439011');
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
        it('should return 404 for non-existing candidate', async () => {
            const response = await (0, supertest_1.default)(index_1.app)
                .delete('/api/candidates/507f1f77bcf86cd799439011')
                .set(authHeader);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
    describe('POST /api/candidates/:id/validate', () => {
        it('should validate candidate and set status to validated', async () => {
            const candidate = await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'validate-route@example.com',
            });
            const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
            const response = await (0, supertest_1.default)(index_1.app)
                .post(`/api/candidates/${candidate._id.toString()}/validate`)
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('validated');
            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
            setTimeoutSpy.mockRestore();
        }, 10000);
        it('should return 401 without authentication', async () => {
            const response = await (0, supertest_1.default)(index_1.app).post('/api/candidates/507f1f77bcf86cd799439011/validate');
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('GET /api/candidates', () => {
        it('should return list with pagination', async () => {
            const payload = Array.from({ length: 11 }).map((_, index) => ({
                ...setup_1.TEST_CANDIDATE,
                email: `list-${index}@example.com`,
            }));
            await Candidate_model_1.CandidateModel.insertMany(payload);
            const response = await (0, supertest_1.default)(index_1.app).get('/api/candidates?page=2&limit=5').set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(5);
            expect(response.body.pagination.total).toBe(11);
            expect(response.body.pagination.pages).toBe(3);
        });
        it('should filter candidates by status and return response structure', async () => {
            await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'status-pending@example.com',
                status: 'pending',
            });
            await Candidate_model_1.CandidateModel.create({
                ...setup_1.TEST_CANDIDATE,
                email: 'status-validated@example.com',
                status: 'validated',
            });
            const response = await (0, supertest_1.default)(index_1.app)
                .get('/api/candidates?status=validated&page=1&limit=10')
                .set(authHeader);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('data');
            expect(response.body).toHaveProperty('pagination');
            expect(response.body.pagination).toHaveProperty('total');
            expect(response.body.pagination).toHaveProperty('pages');
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].status).toBe('validated');
        });
    });
});
