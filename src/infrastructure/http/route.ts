import { GroupId } from '@/domain/group/GroupId';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
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

  app.post('/api/v1/groups/:id/members', async req => {
    const { id } = req.params as { id: string };
    const body = z
      .object({
        payerId: z.uuidv4(),
        amount: z.number().int(),
        description: z.string(),
        splitType: z.enum(['equal', 'percentage', 'fixed']),
        participantsIds: z.array(z.string()).min(1),
        percentages: z.record(z.string(), z.number()).optional(),
        fixedAmounts: z.record(z.string(), z.number()).optional()
      })
      .parse(req.body);

    const expense = await container.recordExpense.execute({
      ...body,
      groupId: id
    });

    return serializeExpense(expense);
  });

  app.post('/api/v1/groups/:id/reserve', async req => {
    const { id } = req.params as { id: string };

    const body = z
      .object({
        memberId: z.uuidv4(),
        amount: z.number().int(),
        description: z.string()
      })
      .parse(req.body);

    await container.contributeReserve.execute(
      id,
      body.memberId,
      body.amount,
      body.description
    );

    const group = await container.groupRepo.findById(GroupId.create(id));

    return {
      reserveBalance: group?.getReserveFund().getBalance().toDecimalString()
    };
  });

  app.get('/api/v1/groups/:id/balances', async req => {
    const { id } = req.params as { id: string };

    const balances = await container.getBalances.execute(id);

    return balances.map(b => serializeBalance(b));
  });

  app.get('/api/v1/groups/:id/clearing', async req => {
    const { id } = req.params as { id: string };

    const body = z
      .object({
        title: z.string(),
        targetAmount: z.number().int(),
        deadline: z.date().optional()
      })
      .parse(req.body);
  });

  app.post('/api/v1/goals/:goalId/contribute', async req => {
    const { goalId } = req.params as { goalId: string };

    const body = z
      .object({
        memberId: z.uuidv4(),
        amount: z.number().int()
      })
      .parse(req.body);

    await container.contributeGoal.execute(goalId, body.memberId, body.amount);

    return { success: true };
  });
}
