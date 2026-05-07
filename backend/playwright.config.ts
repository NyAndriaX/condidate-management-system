import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      // Start the Express backend (nodemon + ts-node)
      command: 'npm run dev',
      url: 'http://localhost:5000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      // Inherits full process.env; MONGODB_URI, JWT_SECRET, PORT come from CI env / .env
    },
    {
      // Start the React frontend dev server
      command: 'yarn --cwd ../frontend start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env as Record<string, string>,
        BROWSER: 'none',
        // react-scripts with CI=true treats warnings as errors; set to false
        CI: 'false',
        PORT: '3000',
        REACT_APP_API_URL: 'http://localhost:5000/api',
      },
    },
  ],
});
