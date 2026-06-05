import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  sql: ReturnType<typeof postgres> | undefined;
  db: ReturnType<typeof drizzle<typeof schema>>;
};

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url)
    throw new Error('DATABASE_URL é obrigatório para o cliente do drizzle');

  const sql = postgres(url);
  const db = drizzle(sql, { schema });
  return { sql, db };
}

const client =
  globalForDb.db && globalForDb.sql
    ? { sql: globalForDb.sql, db: globalForDb.db }
    : createClient();

export const sql = client.sql;
export const db = client.db;

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = client.sql;
  globalForDb.db = client.db;
}
