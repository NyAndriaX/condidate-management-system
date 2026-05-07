"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const validation_middleware_1 = require("../../src/middleware/validation.middleware");
describe('validation.middleware validate', () => {
    const schema = zod_1.z.object({
        name: zod_1.z.string().min(2, 'name too short'),
        age: zod_1.z.number().min(18, 'age must be >= 18'),
    });
    let next;
    let statusMock;
    let jsonMock;
    let res;
    beforeEach(() => {
        next = jest.fn();
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = {
            status: statusMock,
        };
    });
    it('should pass when validation succeeds', () => {
        const req = {
            body: {
                name: 'Alice',
                age: 25,
            },
        };
        const middleware = (0, validation_middleware_1.validate)(schema);
        middleware(req, res, next);
        expect(next).toHaveBeenCalledWith();
        expect(statusMock).not.toHaveBeenCalled();
    });
    it('should return 400 with detailed errors when validation fails', () => {
        const req = {
            body: {
                name: 'A',
                age: 15,
            },
        };
        const middleware = (0, validation_middleware_1.validate)(schema);
        middleware(req, res, next);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            success: false,
            message: 'Erreurs de validation',
            errors: [
                { field: 'name', message: 'name too short' },
                { field: 'age', message: 'age must be >= 18' },
            ],
        });
        expect(next).not.toHaveBeenCalled();
    });
    it('should forward non-Zod errors to next()', () => {
        const unexpectedError = new Error('unexpected boom');
        const explosiveSchema = {
            parse: jest.fn(() => {
                throw unexpectedError;
            }),
        };
        const req = { body: {} };
        const middleware = (0, validation_middleware_1.validate)(explosiveSchema);
        middleware(req, res, next);
        expect(next).toHaveBeenCalledWith(unexpectedError);
        expect(statusMock).not.toHaveBeenCalled();
    });
});
