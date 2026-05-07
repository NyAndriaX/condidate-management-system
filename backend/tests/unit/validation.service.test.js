"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_service_1 = require("../../src/services/validation.service");
describe('ValidationService', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });
    it('should wait 2 seconds in validateAsync', async () => {
        jest.useFakeTimers();
        jest.spyOn(Math, 'random').mockReturnValue(0.8);
        const validationPromise = validation_service_1.validationService.validateAsync('candidate-id');
        await jest.advanceTimersByTimeAsync(2000);
        const result = await validationPromise;
        expect(result).toBe(true);
    });
    it('should return a boolean value', async () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.2);
        const result = await validation_service_1.validationService.validateAsync('candidate-id');
        expect(typeof result).toBe('boolean');
        expect(result).toBe(false);
    });
});
