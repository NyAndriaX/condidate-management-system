import bcrypt from 'bcryptjs';

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

  it('should not re-hash password when it is not modified on save', async () => {
    const user = await UserModel.create({
      email: 'user-rehash@example.com',
      password: TEST_USER.password,
      name: TEST_USER.name,
      role: TEST_USER.role,
    });

    const originalHash = user.password;

    user.name = 'Updated Name';
    await user.save();

    expect(user.password).toBe(originalHash);
  });

  it('should serialize via toJSON without __v and with string _id', async () => {
    const user = await UserModel.create({
      email: 'user-tojson@example.com',
      password: TEST_USER.password,
      name: TEST_USER.name,
      role: TEST_USER.role,
    });

    const json = user.toJSON() as Record<string, unknown>;

    expect(json).not.toHaveProperty('__v');
    expect(typeof json._id).toBe('string');
  });

  it('should propagate errors from password hashing in pre-save hook', async () => {
    const bcryptModule = bcrypt as unknown as {
      hash: (data: string, salt: number) => Promise<string>;
    };
    const originalHash = bcryptModule.hash;
    bcryptModule.hash = jest
      .fn()
      .mockRejectedValueOnce(new Error('hash failed')) as unknown as typeof bcryptModule.hash;

    const user = new UserModel({
      email: 'user-hash-error@example.com',
      password: TEST_USER.password,
      name: TEST_USER.name,
      role: TEST_USER.role,
    });

    try {
      await expect(user.save()).rejects.toThrow('hash failed');
    } finally {
      bcryptModule.hash = originalHash;
    }
  });
});
