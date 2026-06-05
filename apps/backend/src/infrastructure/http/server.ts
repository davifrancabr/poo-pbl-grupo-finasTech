import cors from '@fastify/cors';
import Fastify from 'fastify';

const PORT = Number(process.env.PORT ?? 3000);

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: ['http://localhost:5500', 'http://localhost:5173']
});

await app.listen({ port: PORT, host: '0.0.0.0' });

console.log(`FinasTech API Rodando em http://localhost:${PORT}`);
