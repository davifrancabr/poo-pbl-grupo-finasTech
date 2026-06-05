import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod';
import z from 'zod';

export const buildApp = () => {
  const app = Fastify({ logger: true });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'FinasTech API',
        description: 'Documentação do backend do FinasTech',
        version: '1.0.0'
      },
      servers: []
    },
    transform: jsonSchemaTransform
  });

  app.register(fastifySwaggerUi, {
    routePrefix: '/docs'
  });

  app.register(cors, {
    origin: ['http://localhost:5500', 'http://localhost:5173']
  });

  app.after(() => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/login',
      schema: {
        body: z.object({
          username: z.string(),
          password: z.string()
        })
      },
      handler: async (req, res) => {
        res.send('ok');
      }
    });
  });

  app.listen({ port: 3000, host: '0.0.0.0' });

  console.log('FinasTech API Rodando em http://localhost:3000');
  return app;
};
