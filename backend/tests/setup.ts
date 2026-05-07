import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

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

let mongoServer: MongoMemoryServer;

export const TEST_USER = {
  email: 'test.user@example.com',
  password: 'Password123!',
  name: 'Test User',
  role: 'user' as const,
};

export const TEST_CANDIDATE = {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'candidate@example.com',
  phone: '+33612345678',
  position: 'Backend Developer',
  experience: 5,
  skills: ['TypeScript', 'Node.js'],
};

export const generateTestToken = (payload?: {
  userId?: string;
  email?: string;
  role?: 'admin' | 'user';
}): string =>
  jwt.sign(
    {
      userId: payload?.userId ?? new mongoose.Types.ObjectId().toString(),
      email: payload?.email ?? TEST_USER.email,
      role: payload?.role ?? TEST_USER.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' },
  );

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
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  process.env.MONGODB_URI = mongoUri;

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
