"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = require("../../src/middleware/auth.middleware");
const AppError_1 = require("../../src/utils/AppError");
const setup_1 = require("../setup");
describe('auth.middleware authenticate', () => {
    const res = {};
    let next;
    beforeEach(() => {
        next = jest.fn();
    });
    it('should populate req.user with valid token', () => {
        const token = (0, setup_1.generateTestToken)({
            userId: 'user-123',
            email: 'valid@example.com',
            role: 'admin',
        });
        const req = {
            headers: {
                authorization: `Bearer ${token}`,
            },
        };
        (0, auth_middleware_1.authenticate)(req, res, next);
        expect(req.user).toEqual({
            userId: 'user-123',
            email: 'valid@example.com',
            role: 'admin',
        });
        expect(next).toHaveBeenCalledWith();
    });
    it('should return 401 when token is missing', () => {
        const req = {
            headers: {},
        };
        (0, auth_middleware_1.authenticate)(req, res, next);
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError_1.AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('manquant');
    });
    it('should return 401 for invalid token', () => {
        const req = {
            headers: {
                authorization: 'Bearer invalid-token',
            },
        };
        (0, auth_middleware_1.authenticate)(req, res, next);
        const error = next.mock.calls[0][0];
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('invalide');
    });
    it('should return 401 for expired token', () => {
        const expiredToken = jsonwebtoken_1.default.sign({
            userId: 'expired-user',
        }, process.env.JWT_SECRET, { expiresIn: '0s' });
        const req = {
            headers: {
                authorization: `Bearer ${expiredToken}`,
            },
        };
        (0, auth_middleware_1.authenticate)(req, res, next);
        const error = next.mock.calls[0][0];
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('expire');
    });
    it('should return 401 when scheme is not Bearer', () => {
        const req = {
            headers: {
                authorization: 'Basic some-credential',
            },
        };
        (0, auth_middleware_1.authenticate)(req, res, next);
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError_1.AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('Bearer');
    });
    it('should return 401 when Bearer token part is missing', () => {
        const req = {
            headers: {
                authorization: 'Bearer ',
            },
        };
        (0, auth_middleware_1.authenticate)(req, res, next);
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError_1.AppError);
        expect(error.statusCode).toBe(401);
    });
    it('should return 401 when token payload has no userId', () => {
        const tokenWithoutUserId = jsonwebtoken_1.default.sign({ email: 'no-id@example.com' }, process.env.JWT_SECRET);
        const req = {
            headers: {
                authorization: `Bearer ${tokenWithoutUserId}`,
            },
        };
        (0, auth_middleware_1.authenticate)(req, res, next);
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError_1.AppError);
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain('utilisateur');
    });
});
