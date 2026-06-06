import { configDotenv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

configDotenv({ path: ['.env'] });

export default defineConfig({
  out: './drizzle',
  dialect: 'postgresql',
  schema: './src/infrastructure/persistence/db/schema.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ''
  }
});
