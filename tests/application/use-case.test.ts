import { FastifyInstance } from 'fastify';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../src/infrastructure/persistence/drizzle/client';
import { expenses } from '../../src/infrastructure/persistence/drizzle/schema';

let app: FastifyInstance;

beforeEach(async () => {
  await db.delete(expenses);
});

describe('Caso de usos', () => {});
