"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_model_1 = require("../../src/models/User.model");
const setup_1 = require("../setup");
describe('UserModel', () => {
    it('should hash password before save', async () => {
        const user = await User_model_1.UserModel.create({
            email: 'user-model@example.com',
            password: setup_1.TEST_USER.password,
            name: setup_1.TEST_USER.name,
            role: setup_1.TEST_USER.role,
        });
        expect(user.password).not.toBe(setup_1.TEST_USER.password);
        expect(user.password.length).toBeGreaterThan(20);
    });
    it('should compare password correctly', async () => {
        const user = await User_model_1.UserModel.create({
            email: 'user-compare@example.com',
            password: setup_1.TEST_USER.password,
            name: setup_1.TEST_USER.name,
            role: setup_1.TEST_USER.role,
        });
        await expect(user.comparePassword(setup_1.TEST_USER.password)).resolves.toBe(true);
        await expect(user.comparePassword('wrong-password')).resolves.toBe(false);
    });
    it('should not re-hash password when it is not modified on save', async () => {
        const user = await User_model_1.UserModel.create({
            email: 'user-rehash@example.com',
            password: setup_1.TEST_USER.password,
            name: setup_1.TEST_USER.name,
            role: setup_1.TEST_USER.role,
        });
        const originalHash = user.password;
        user.name = 'Updated Name';
        await user.save();
        expect(user.password).toBe(originalHash);
    });
    it('should serialize via toJSON without __v and with string _id', async () => {
        const user = await User_model_1.UserModel.create({
            email: 'user-tojson@example.com',
            password: setup_1.TEST_USER.password,
            name: setup_1.TEST_USER.name,
            role: setup_1.TEST_USER.role,
        });
        const json = user.toJSON();
        expect(json).not.toHaveProperty('__v');
        expect(typeof json._id).toBe('string');
    });
    it('should propagate errors from password hashing in pre-save hook', async () => {
        const bcryptModule = bcryptjs_1.default;
        const originalHash = bcryptModule.hash;
        bcryptModule.hash = jest
            .fn()
            .mockRejectedValueOnce(new Error('hash failed'));
        const user = new User_model_1.UserModel({
            email: 'user-hash-error@example.com',
            password: setup_1.TEST_USER.password,
            name: setup_1.TEST_USER.name,
            role: setup_1.TEST_USER.role,
        });
        try {
            await expect(user.save()).rejects.toThrow('hash failed');
        }
        finally {
            bcryptModule.hash = originalHash;
        }
    });
});
