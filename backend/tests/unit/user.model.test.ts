import { UserModel } from '../../src/models/User.model';
import { TEST_USER } from '../setup';

describe('UserModel', () => {
  it('should hash password before save', async () => {
    const user = await UserModel.create({
      email: 'user-model@example.com',
      password: TEST_USER.password,
      name: TEST_USER.name,
      role: TEST_USER.role,
    });

    expect(user.password).not.toBe(TEST_USER.password);
    expect(user.password.length).toBeGreaterThan(20);
  });

  it('should compare password correctly', async () => {
    const user = await UserModel.create({
      email: 'user-compare@example.com',
      password: TEST_USER.password,
      name: TEST_USER.name,
      role: TEST_USER.role,
    });

    await expect(user.comparePassword(TEST_USER.password)).resolves.toBe(true);
    await expect(user.comparePassword('wrong-password')).resolves.toBe(false);
  });
});
