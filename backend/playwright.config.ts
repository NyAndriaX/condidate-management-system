import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // Only pick up TypeScript spec files; prevents compiled .js artifacts from running twice
  testMatch: ['**/*.spec.ts'],
  timeout: 60_000,
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      // Express backend — inherits full process.env (MONGODB_URI, JWT_SECRET, PORT=5000)
      command: 'npm run dev',
      url: 'http://localhost:5000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      // React frontend dev server
      // Playwright merges webServer.env with process.env automatically
      command: 'yarn --cwd ../frontend start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        BROWSER: 'none',
        CI: 'false', // react-scripts with CI=true treats warnings as errors
        PORT: '3000',
        REACT_APP_API_URL: 'http://localhost:5000/api',
      },
    },
  ],
});
