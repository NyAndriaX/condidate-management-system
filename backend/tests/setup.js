"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestToken = exports.TEST_CANDIDATE = exports.TEST_USER = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
}
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret';
}
if (!process.env.PORT) {
    process.env.PORT = '5001';
}
if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test-db';
}
let mongoServer;
const useExternalMongo = process.env.USE_EXTERNAL_MONGODB === 'true';
exports.TEST_USER = {
    email: 'test.user@example.com',
    password: 'Password123!',
    name: 'Test User',
    role: 'user',
};
exports.TEST_CANDIDATE = {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'candidate@example.com',
    phone: '+33612345678',
    position: 'Backend Developer',
    experience: 5,
    skills: ['TypeScript', 'Node.js'],
};
const generateTestToken = (payload) => jsonwebtoken_1.default.sign({
    userId: payload?.userId ?? new mongoose_1.default.Types.ObjectId().toString(),
    email: payload?.email ?? exports.TEST_USER.email,
    role: payload?.role ?? exports.TEST_USER.role,
}, process.env.JWT_SECRET, { expiresIn: '24h' });
exports.generateTestToken = generateTestToken;
jest.mock('../src/config/logger', () => ({
    logger: {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        http: jest.fn(),
        debug: jest.fn(),
    },
}));
beforeAll(async () => {
    if (!useExternalMongo) {
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create({
            binary: {
                // Ubuntu 24.04 GitHub runners do not provide MongoDB 6.0.x binaries.
                // Pinning to 7.0.x avoids 403 download failures when in-memory DB is used.
                version: '7.0.14',
            },
        });
        process.env.MONGODB_URI = mongoServer.getUri();
    }
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.disconnect();
    }
    await mongoose_1.default.connect(process.env.MONGODB_URI);
});
beforeEach(async () => {
    const collections = mongoose_1.default.connection.collections;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});
