// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';
import { ReadableStream, TransformStream, WritableStream } from 'stream/web';

Object.assign(global, { TextEncoder, TextDecoder });
Object.assign(global, { ReadableStream, WritableStream, TransformStream });

const { server } = require('./mocks/server');
const { resetMockCandidates } = require('./mocks/handlers');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetMockCandidates();
});
afterAll(() => server.close());
