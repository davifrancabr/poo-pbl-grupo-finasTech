import { serve } from 'bun';
import { app } from './controller/app';

const server = serve({
  fetch: app.fetch,
  port: 3001,
  hostname: '0.0.0.0'
});

console.log(`Servidor rodando em http://localhost:${server.port}`);
