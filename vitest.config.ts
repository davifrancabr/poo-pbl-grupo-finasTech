import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts']
  },
  resolve: {
    alias: {
      '@domain': resolve(__dirname, './src/domain'),
      '@app': resolve(__dirname, './src/application'),
      '@infra': resolve(__dirname, './src/infrastructure')
    }
  }
});
