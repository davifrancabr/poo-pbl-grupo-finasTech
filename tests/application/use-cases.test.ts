import { beforeEach, describe, expect, it } from 'vitest';
import { AddMemberToGroup } from '../../src/application/use-cases/AddMemberToGroup';
import { ContributeToGoal } from '../../src/application/use-cases/ContributeToGoal';
import { ContributeToReserve } from '../../src/application/use-cases/ContributeToReserve';
import { CreateGroup } from '../../src/application/use-cases/CreateGroup';
import { CreateSavingsGoal } from '../../src/application/use-cases/CreateSavingsGoal';
import { GetClearingPlan } from '../../src/application/use-cases/GetClearingPlan';
import { GetGroupBalances } from '../../src/application/use-cases/GetGroupBalancesPlan';
import { RecordExpense } from '../../src/application/use-cases/RecordExpense';
import { InMemoryExpenseRepository } from '../../src/infrastructure/persistence/in-memory/InMemoryExpenseRepository';
import { InMemoryGroupRepository } from '../../src/infrastructure/persistence/in-memory/InMemoryGroupRepository';
import { InMemorySavingsGoalRepository } from '../../src/infrastructure/persistence/in-memory/InMemorySavingsGoalRepository';

describe('Application use cases', () => {
  let groupRepo: InMemoryGroupRepository;
  let expenseRepo: InMemoryExpenseRepository;
  let goalRepo: InMemorySavingsGoalRepository;

  beforeEach(() => {
    groupRepo = new InMemoryGroupRepository();
    expenseRepo = new InMemoryExpenseRepository();
    goalRepo = new InMemorySavingsGoalRepository();
  });

  it('creates group and adds members', async () => {
    const createGroup = new CreateGroup(groupRepo);
    const group = await createGroup.execute('República Finas');
    const addMember = new AddMemberToGroup(groupRepo);
    await addMember.execute(group.getId().getValue(), 'Alice');
    await addMember.execute(group.getId().getValue(), 'Bob');
    const updated = await groupRepo.findById(group.getId());
    expect(updated?.getMembers()).toHaveLength(2);
  });

  it('records expense and calculates clearing', async () => {
    const createGroup = new CreateGroup(groupRepo);
    const group = await createGroup.execute('Viagem');
    const addMember = new AddMemberToGroup(groupRepo);
    const alice = await addMember.execute(group.getId().getValue(), 'Alice');
    const bob = await addMember.execute(group.getId().getValue(), 'Bob');

    const recordExpense = new RecordExpense(groupRepo, expenseRepo);
    await recordExpense.execute({
      groupId: group.getId().getValue(),
      payerId: alice.getId().getValue(),
      amount: '100.00',
      description: 'Hotel',
      splitType: 'equal',
      participantsIds: [alice.getId().getValue(), bob.getId().getValue()]
    });

    const getBalances = new GetGroupBalances(groupRepo, expenseRepo);
    const balances = await getBalances.execute(group.getId().getValue());
    expect(balances).toHaveLength(2);

    const getClearing = new GetClearingPlan(getBalances);
    const settlements = await getClearing.execute(group.getId().getValue());
    expect(settlements.length).toBeGreaterThan(0);
  });

  it('manages savings goals', async () => {
    const createGroup = new CreateGroup(groupRepo);
    const group = await createGroup.execute('Meta');
    const addMember = new AddMemberToGroup(groupRepo);
    const alice = await addMember.execute(group.getId().getValue(), 'Alice');

    const createGoal = new CreateSavingsGoal(groupRepo, goalRepo);
    const goal = await createGoal.execute(
      group.getId().getValue(),
      'Viagem',
      '1000.00'
    );

    const contribute = new ContributeToGoal(groupRepo, goalRepo);
    await contribute.execute(
      goal.getId().getValue(),
      alice.getId().getValue(),
      '200.00'
    );

    const goals = await goalRepo.findByGroupId(group.getId());
    expect(goals[0]?.getProgressPercent()).toBe(20);
  });

  it('contributes to reserve fund', async () => {
    const createGroup = new CreateGroup(groupRepo);
    const group = await createGroup.execute('Fundo');
    const addMember = new AddMemberToGroup(groupRepo);
    const alice = await addMember.execute(group.getId().getValue(), 'Alice');

    const contribute = new ContributeToReserve(groupRepo);
    await contribute.execute(
      group.getId().getValue(),
      alice.getId().getValue(),
      '50.00',
      'Mensal'
    );

    const updated = await groupRepo.findById(group.getId());
    expect(updated?.getReserveFund().getBalance().toDecimalString()).toBe(
      '50.00'
    );
  });
});
