import { GroupId } from '@/domain/group/GroupId';
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
import { createContainer } from './container';
import {
  serializeBalance,
  serializeExpense,
  serializeGoal,
  serializeGroup,
  serializeSettlement
} from './serializers';

const container = createContainer();

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
      method: 'GET',
      url: '/api/v1/health',
      handler: async () => {
        return {
          status: 'ok',
          service: 'FinasTech',
          timestamp: new Date().toISOString()
        };
      }
    });

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/api/v1/groups',
      handler: async () => {
        const groups = await container.listGroups.execute();

        return groups.map(serializeGroup);
      }
    });

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/api/v1/groups',
      schema: {
        body: z.object({
          name: z.string(),
          currency: z.string().optional()
        })
      },
      handler: async req => {
        const group = await container.createGroup.execute(
          req.body.name,
          req.body.currency
        );

        return serializeGroup(group);
      }
    });

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/api/v1/groups/:id',
      schema: {
        params: z.object({
          id: z.uuidv4()
        })
      },
      handler: async req => {
        const { id } = req.params;
        const dashboard = await container.getDashboard.execute(id);

        const names = new Map(
          dashboard
            .group!.getMembers()
            .map(m => [m.getId().getValue(), m.getName()])
        );

        return {
          group: serializeGroup(dashboard.group!),
          expenses: dashboard.expenses.map(serializeExpense),
          goals: dashboard.goals.map(serializeGoal),
          balances: dashboard.balances.map(b =>
            serializeBalance(b, names.get(b.getMemberId().getValue()))
          ),
          settlements: dashboard.settlements.map(s =>
            serializeSettlement(s, names)
          )
        };
      }
    });

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/api/v1/groups/:id/members',
      schema: {
        body: z.object({
          name: z.string().min(2)
        }),
        params: z.object({
          id: z.uuidv4()
        })
      },
      handler: async req => {
        const { id } = req.params;
        const member = await container.addMember.execute(id, req.body.name);

        return { id: member.getId().getValue(), name: member.getName() };
      }
    });

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/api/v1/groups/:id/expenses',
      schema: {
        body: z.object({
          payerId: z.uuidv4(),
          amount: z.string(),
          description: z.string(),
          splitType: z.enum(['equal', 'percentage', 'fixed']),
          participantsIds: z.array(z.string()).min(1),
          percentages: z.record(z.string(), z.number()).optional(),
          fixedAmounts: z.record(z.string(), z.string()).optional()
        }),
        params: z.object({
          id: z.uuidv4()
        })
      },
      handler: async req => {
        const { id } = req.params;

        const expense = await container.recordExpense.execute({
          ...req.body,
          groupId: id
        });

        return serializeExpense(expense);
      }
    });

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/api/v1/groups/:id/reserve',
      schema: {
        body: z.object({
          memberId: z.uuidv4(),
          amount: z.string(),
          description: z.string()
        }),
        params: z.object({
          id: z.uuidv4()
        })
      },
      handler: async req => {
        const { id } = req.params;

        await container.contributeReserve.execute(
          id,
          req.body.memberId,
          req.body.amount,
          req.body.description
        );

        const group = await container.groupRepo.findById(GroupId.create(id));

        return {
          reserveBalance: group?.getReserveFund().getBalance().toDecimalString()
        };
      }
    });

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/api/v1/groups/:id/balances',
      schema: {
        params: z.object({
          id: z.uuidv4()
        })
      },
      handler: async req => {
        const { id } = req.params;

        const balances = await container.getBalances.execute(id);

        return balances.map(b => serializeBalance(b));
      }
    });

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/api/v1/groups/:id/clearing',

      schema: {
        params: z.object({
          id: z.uuidv4(),
          name: z.string(),
          amount: z.string()
        })
      },
      handler: async req => {
        const { id } = req.params;

        const settlements = await container.getClearing.execute(id);

        return settlements.map(s => ({
          fromMemberId: s.getFromMemberId().getValue(),
          toMemberId: s.getToMemberId().getValue(),
          amount: s.getAmount().toDecimalString()
        }));
      }
    });

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/api/v1/groups/:id/goals',
      schema: {
        body: z.object({
          title: z.string(),
          targetAmount: z.string(),
          deadline: z.date().optional()
        }),
        params: z.object({
          id: z.uuidv4()
        })
      },
      handler: async req => {
        const { id } = req.params;

        const goal = await container.createGoal.execute(
          id,
          req.body.title,
          req.body.targetAmount,
          req.body.deadline
        );

        return serializeGoal(goal);
      }
    });

    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/api/v1/goals/:goalId/contribute',
      schema: {
        body: z.object({
          memberId: z.uuidv4(),
          amount: z.string()
        }),
        params: z.object({
          goalId: z.uuidv4()
        })
      },
      handler: async req => {
        const { goalId } = req.params;

        await container.contributeGoal.execute(
          goalId,
          req.body.memberId,
          req.body.amount
        );

        return { success: true };
      }
    });
  });

  app.listen({ port: 3000, host: '0.0.0.0' });

  console.log('FinasTech API Rodando em http://localhost:3000');
  console.log('Documentação disponível em http://localhost:3000/docs');

  return app;
};
