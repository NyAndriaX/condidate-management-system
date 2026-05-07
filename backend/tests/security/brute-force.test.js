"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../../src/index");
const User_model_1 = require("../../src/models/User.model");
const setup_1 = require("../setup");
describe('Security - Brute force protection', () => {
    it('should block the 101st login request with 429', async () => {
        const email = 'bruteforce@test.com';
        await User_model_1.UserModel.create({
            email,
            password: setup_1.TEST_USER.password,
            name: setup_1.TEST_USER.name,
        });
        let lastResponse;
        for (let index = 0; index < 101; index += 1) {
            // Use invalid password to simulate brute-force attempts.
            // eslint-disable-next-line no-await-in-loop
            lastResponse = await (0, supertest_1.default)(index_1.app).post('/api/auth/login').send({
                email,
                password: `wrong-password-${index}`,
            });
        }
        expect(lastResponse?.status).toBe(429);
        expect(String(lastResponse?.text ?? '')).toContain('Trop de requetes');
    }, 30000);
});
