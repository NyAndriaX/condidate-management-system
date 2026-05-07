"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Playwright global setup — runs once before any E2E test.
 * Ensures the test user exists in the database by calling the backend API.
 * The backend webServer is guaranteed to be up before this runs.
 */
async function globalSetup() {
    const backendUrl = 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test.user@example.com',
            password: 'Password123!',
            name: 'Test User',
        }),
    });
    // 201 = user created, 409 = already exists — both are acceptable
    if (!res.ok && res.status !== 409) {
        const body = await res.text();
        throw new Error(`E2E global setup: failed to create test user (HTTP ${res.status}): ${body}`);
    }
}
exports.default = globalSetup;
