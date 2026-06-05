import { seed } from 'drizzle-seed';
import { db } from '../src/infrastructure/persistence/drizzle/client';
import * as schema from '../src/infrastructure/persistence/drizzle/schema';

const bancoTeste = [
  {
    name: 'Antonio',
    email: 'admin@finans.com',
    groupId: 'dsadsadsadas',
    senha: '123'
  },
  {
    name: 'Joaquim',
    email: 'usuario@teste.com',
    senha: 'abc',
    groupId: ''
  }
];

const d = schema.members;

bancoTeste.forEach(async d => {
  await db.insert(schema.members).values({
    name: d.name,
    email: d.email,
    password: d.senha
  });
});

await seed(db, { d }).refine(f => ({
  d: {
    columns: {
      name: f.fullName(),
      email: f.email(),
      password: f.string({ arraySize: 12 })
    },
    count: 10
  }
}));
