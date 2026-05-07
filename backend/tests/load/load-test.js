import http from 'k6/http';
import { check, fail } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 500 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
const PASSWORD = 'Password123!';

export function setup() {
  const uniqueSuffix = Date.now();
  const email = `k6.user.${uniqueSuffix}@test.com`;

  const registerPayload = JSON.stringify({
    email,
    password: PASSWORD,
    name: 'K6 Test User',
  });

  const registerRes = http.post(`${BASE_URL}/api/auth/register`, registerPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (registerRes.status !== 201 && registerRes.status !== 409) {
    fail(`Unable to register setup user. Status=${registerRes.status}`);
  }

  const loginPayload = JSON.stringify({
    email,
    password: PASSWORD,
  });

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const loginOk = check(loginRes, {
    'setup login status is 200': (r) => r.status === 200,
    'setup login returns token': (r) => Boolean(r.json('token')),
  });

  if (!loginOk) {
    fail(`Unable to login in setup. Status=${loginRes.status}`);
  }

  return { token: loginRes.json('token') };
}

export default function runLoad(data) {
  const uniqueEmail = `candidate.${__VU}.${__ITER}.${Date.now()}@test.com`;
  const payload = JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: uniqueEmail,
    phone: '+261340000000',
    position: 'Developpeur Full Stack',
    experience: 5,
    skills: ['JavaScript', 'TypeScript', 'React'],
  });

  const response = http.post(`${BASE_URL}/api/candidates`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.token}`,
    },
  });

  check(response, {
    'POST /api/candidates returns 201': (r) => r.status === 201,
  });
}
