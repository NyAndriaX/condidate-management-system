import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validate } from '../../src/middleware/validation.middleware';

describe('validation.middleware validate', () => {
  const schema = z.object({
    name: z.string().min(2, 'name too short'),
    age: z.number().min(18, 'age must be >= 18'),
  });

  let next: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let res: Response;

  beforeEach(() => {
    next = jest.fn();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = {
      status: statusMock,
    } as unknown as Response;
  });

  it('should pass when validation succeeds', () => {
    const req = {
      body: {
        name: 'Alice',
        age: 25,
      },
    } as Request;

    const middleware = validate(schema);
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
    } as Request;

    const middleware = validate(schema);
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
});
