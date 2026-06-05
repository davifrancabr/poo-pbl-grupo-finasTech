import type { ExpenseRepository } from '@/application/ports/ExpenseRepository';
import type { GroupRepository } from '@/application/ports/GroupRepository';
import type { SavingsGoalRepository } from '@/application/ports/SavingsGoalRepository';
import { AddMemberToGroup } from '@/application/use-cases/AddMemberToGroup';
import { ContributeToGoal } from '@/application/use-cases/ContributeToGoal';
import { ContributeToReserve } from '@/application/use-cases/ContributeToReserve';
import { CreateGroup } from '@/application/use-cases/CreateGroup';
import { CreateSavingsGoal } from '@/application/use-cases/CreateSavingsGoal';
import { GetClearingPlan } from '@/application/use-cases/GetClearingPlan';
import { GetGroupBalances } from '@/application/use-cases/GetGroupBalancesPlan';
import { GetGroupDashboard } from '@/application/use-cases/GetGroupDashboard';
import { ListGroups } from '@/application/use-cases/ListGroups';
import { RecordExpense } from '@/application/use-cases/RecordExpense';
import { DrizzleExpenseRepository } from '../persistence/drizzle/DrizzleExpenseRepository';
import { DrizzleGroupRepository } from '../persistence/drizzle/DrizzleGroupRepository';
import { DrizzleSavingsGoalRepository } from '../persistence/drizzle/DrizzleSavingsGoalRepository';
import { InMemoryExpenseRepository } from '../persistence/in-memory/InMemoryExpenseRepository';
import { InMemoryGroupRepository } from '../persistence/in-memory/InMemoryGroupRepository';
import { InMemorySavingsGoalRepository } from '../persistence/in-memory/InMemorySavingsGoalRepository';

function useMemoryRepos(): boolean {
  return process.env.USE_MEMORY_DB === 'true' || !process.env.DATABASE_URL;
}

export function createContainer() {
  let groupRepo: GroupRepository;
  let expenseRepo: ExpenseRepository;
  let goalRepo: SavingsGoalRepository;

  if (useMemoryRepos()) {
    groupRepo = new InMemoryGroupRepository();
    expenseRepo = new InMemoryExpenseRepository();
    goalRepo = new InMemorySavingsGoalRepository();
  } else {
    groupRepo = new DrizzleGroupRepository();
    expenseRepo = new DrizzleExpenseRepository();
    goalRepo = new DrizzleSavingsGoalRepository();
  }

  const getBalances = new GetGroupBalances(groupRepo, expenseRepo);
  const getClearing = new GetClearingPlan(getBalances);

  return {
    createGroup: new CreateGroup(groupRepo),
    listGroups: new ListGroups(groupRepo),
    addMember: new AddMemberToGroup(groupRepo),
    recordExpense: new RecordExpense(groupRepo, expenseRepo),
    contributeReserve: new ContributeToReserve(groupRepo),
    getBalances,
    getClearing,
    createGoal: new CreateSavingsGoal(groupRepo, goalRepo),
    contributeGoal: new ContributeToGoal(groupRepo, goalRepo),
    getDashboard: new GetGroupDashboard(
      groupRepo,
      expenseRepo,
      goalRepo,
      getBalances,
      getClearing
    ),
    groupRepo
  };
}
