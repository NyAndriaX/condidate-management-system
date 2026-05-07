"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../../src/index");
const setup_1 = require("../setup");
describe('Security - JWT protection', () => {
    it('should reject expired JWT with 401', async () => {
        const expiredToken = jsonwebtoken_1.default.sign({ userId: 'expired-user' }, process.env.JWT_SECRET, {
            expiresIn: '-1s',
        });
        const response = await (0, supertest_1.default)(index_1.app)
            .get('/api/candidates')
            .set('Authorization', `Bearer ${expiredToken}`);
        expect(response.status).toBe(401);
    });
    it('should reject tampered JWT payload with 401', async () => {
        const validToken = (0, setup_1.generateTestToken)({ userId: 'payload-user' });
        const tokenParts = validToken.split('.');
        const tamperedPayload = Buffer.from(JSON.stringify({
            userId: 'attacker',
            role: 'admin',
        }), 'utf8')
            .toString('base64url')
            .replace(/=/g, '');
        const tamperedToken = `${tokenParts[0]}.${tamperedPayload}.${tokenParts[2]}`;
        const response = await (0, supertest_1.default)(index_1.app)
            .get('/api/candidates')
            .set('Authorization', `Bearer ${tamperedToken}`);
        expect(response.status).toBe(401);
    });
    it('should reject JWT signed with wrong secret with 401', async () => {
        const wrongSignedToken = jsonwebtoken_1.default.sign({ userId: 'wrong-signature-user' }, 'wrong-secret', {
            expiresIn: '1h',
        });
        const response = await (0, supertest_1.default)(index_1.app)
            .get('/api/candidates')
            .set('Authorization', `Bearer ${wrongSignedToken}`);
        expect(response.status).toBe(401);
    });
    it('should reject access without token with 401', async () => {
        const response = await (0, supertest_1.default)(index_1.app).get('/api/candidates');
        expect(response.status).toBe(401);
    });
});
