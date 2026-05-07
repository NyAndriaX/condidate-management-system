import { validationService } from '../../src/services/validation.service';

describe('ValidationService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should wait 2 seconds in validateAsync', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0.8);

    const validationPromise = validationService.validateAsync('candidate-id');
    await jest.advanceTimersByTimeAsync(2000);
    const result = await validationPromise;

    expect(result).toBe(true);
  });

  it('should return a boolean value', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.2);
    const result = await validationService.validateAsync('candidate-id');

    expect(typeof result).toBe('boolean');
    expect(result).toBe(false);
  });
});
