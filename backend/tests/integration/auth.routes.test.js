"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../../src/index");
const User_model_1 = require("../../src/models/User.model");
const setup_1 = require("../setup");
describe('Auth Routes Integration', () => {
    describe('POST /api/auth/register', () => {
        it('should register with valid data and return token', async () => {
            const response = await (0, supertest_1.default)(index_1.app).post('/api/auth/register').send({
                email: 'register-valid@example.com',
                password: setup_1.TEST_USER.password,
                name: setup_1.TEST_USER.name,
            });
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.email).toBe('register-valid@example.com');
            expect(response.body.user).not.toHaveProperty('password');
        });
        it('should return 409 when email is duplicate', async () => {
            const duplicateEmail = 'register-duplicate@example.com';
            await User_model_1.UserModel.create({
                email: duplicateEmail,
                password: setup_1.TEST_USER.password,
                name: setup_1.TEST_USER.name,
            });
            const response = await (0, supertest_1.default)(index_1.app).post('/api/auth/register').send({
                email: duplicateEmail,
                password: setup_1.TEST_USER.password,
                name: setup_1.TEST_USER.name,
            });
            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
        });
        it('should return 400 with invalid payload', async () => {
            const response = await (0, supertest_1.default)(index_1.app).post('/api/auth/register').send({
                email: 'invalid-email',
                password: '123',
                name: '',
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(Array.isArray(response.body.errors)).toBe(true);
        });
    });
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await User_model_1.UserModel.create({
                email: 'login-valid@example.com',
                password: setup_1.TEST_USER.password,
                name: setup_1.TEST_USER.name,
            });
        });
        it('should login with valid credentials and return token', async () => {
            const response = await (0, supertest_1.default)(index_1.app).post('/api/auth/login').send({
                email: 'login-valid@example.com',
                password: setup_1.TEST_USER.password,
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.email).toBe('login-valid@example.com');
        });
        it('should return 401 with invalid email', async () => {
            const response = await (0, supertest_1.default)(index_1.app).post('/api/auth/login').send({
                email: 'not-found@example.com',
                password: setup_1.TEST_USER.password,
            });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
        it('should return 401 with invalid password', async () => {
            const response = await (0, supertest_1.default)(index_1.app).post('/api/auth/login').send({
                email: 'login-valid@example.com',
                password: 'wrong-password',
            });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
