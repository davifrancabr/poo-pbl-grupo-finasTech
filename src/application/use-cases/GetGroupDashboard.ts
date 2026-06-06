import { GroupId } from '../../domain/group/GroupId';
import type { ExpenseRepository } from '../ports/ExpenseRepository';
import type { GroupRepository } from '../ports/GroupRepository';
import type { SavingsGoalRepository } from '../ports/SavingsGoalRepository';
import type { GetClearingPlan } from './GetClearingPlan';
import type { GetGroupBalances } from './GetGroupBalancesPlan';

export interface GroupDashboard {
  group: Awaited<ReturnType<GroupRepository['findById']>>;
  expenses: Awaited<ReturnType<ExpenseRepository['findByGroupId']>>;
  goals: Awaited<ReturnType<SavingsGoalRepository['findByGroupId']>>;
  balances: Awaited<ReturnType<GetGroupBalances['execute']>>;
  settlements: Awaited<ReturnType<GetClearingPlan['execute']>>;
}

export class GetGroupDashboard {
  constructor(
    private readonly groupRepo: GroupRepository,
    private readonly expenseRepo: ExpenseRepository,
    private readonly goalRepo: SavingsGoalRepository,
    private readonly getBalances: GetGroupBalances,
    private readonly getClearing: GetClearingPlan
  ) {}

  async execute(groupId: string): Promise<GroupDashboard> {
    const id = GroupId.create(groupId);
    const group = await this.groupRepo.findById(id);
    if (!group) throw new Error('Grupo não encontrado.');

    const [expenses, goals, balances, settlements] = await Promise.all([
      this.expenseRepo.findByGroupId(id),
      this.goalRepo.findByGroupId(id),
      this.getBalances.execute(groupId),
      this.getClearing.execute(groupId)
    ]);

    return { group, expenses, goals, balances, settlements };
  }
}
