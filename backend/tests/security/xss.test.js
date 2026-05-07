"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../../src/index");
const setup_1 = require("../setup");
describe('Security - XSS protection', () => {
    const authToken = (0, setup_1.generateTestToken)();
    it('should reject XSS payload in firstName', async () => {
        const response = await (0, supertest_1.default)(index_1.app)
            .post('/api/candidates')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            firstName: "<script>alert('XSS')</script>",
            lastName: 'Doe',
            email: 'xss-firstname@test.com',
            phone: '+261340000000',
            position: 'Developpeur Full Stack',
            experience: 5,
            skills: ['JavaScript'],
        });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
    it('should reject XSS payload in skills', async () => {
        const response = await (0, supertest_1.default)(index_1.app)
            .post('/api/candidates')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            firstName: 'John',
            lastName: 'Doe',
            email: 'xss-skills@test.com',
            phone: '+261340000000',
            position: 'Developpeur Full Stack',
            experience: 5,
            skills: ["<img src=x onerror=alert('XSS')>"],
        });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
