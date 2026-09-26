import { defineConfig } from '@playwright/test';
const port = process.env.E2E_PORT || '5173';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: process.env.E2E_BASE_URL || `http://127.0.0.1:${port}`, trace: 'retain-on-failure' },
  reporter: 'list',
  webServer: {
    command: `npm run dev -w farmiq-frontend -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true } },
  ],
});
