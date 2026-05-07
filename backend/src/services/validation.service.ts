export class ValidationService {
  public async validateAsync(candidateId: string): Promise<boolean> {
    void candidateId;
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 2000);
    });

    return Math.random() >= 0.5;
  }
}

export const validationService = new ValidationService();
