import type { FastifyInstance } from 'fastify';
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

export async function registerRoutes(app: FastifyInstance) {
  app.get('/api/v1/health', async () => ({
    status: 'ok',
    service: 'FinasTech',
    timestamp: new Date().toISOString()
  }));

  app.get('/api/v1/groups', async () => {
    const groups = await container.listGroups.execute();

    return groups.map(serializeGroup);
  });

  app.post('/api/v1/groups', async req => {
    const body = z
      .object({
        name: z.string().min(2),
        currency: z.string().optional()
      })
      .parse(req.body);
    const group = await container.createGroup.execute(body.name, body.currency);

    return serializeGroup(group);
  });

  app.get('/api/v1/groups/:id', async req => {
    const { id } = req.params as { id: string };
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
      settlements: dashboard.settlements.map(s => serializeSettlement(s, names))
    };
  });

  app.post('/api/v1/groups/:id/members', async req => {});
}
