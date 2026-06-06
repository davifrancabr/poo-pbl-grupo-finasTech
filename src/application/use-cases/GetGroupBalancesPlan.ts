import { BalanceCalculator } from '../../domain/clearing/BalanceCalculator';
import type { MemberBalance } from '../../domain/clearing/MemberBalance';
import { GroupId } from '../../domain/group/GroupId';
import type { ExpenseRepository } from '../ports/ExpenseRepository';
import type { GroupRepository } from '../ports/GroupRepository';

export class GetGroupBalances {
  private readonly calculator = new BalanceCalculator();

  constructor(
    private readonly groupRepo: GroupRepository,
    private readonly expenseRepo: ExpenseRepository
  ) {}

  async execute(groupId: string): Promise<MemberBalance[]> {
    const group = await this.groupRepo.findById(GroupId.create(groupId));
    if (!group) throw new Error('Grupo não encontrado.');

    const expenses = await this.expenseRepo.findByGroupId(group.getId());

    const memberIds = group.getMembers().map(m => m.getId());

    return this.calculator.calculate(
      memberIds,
      expenses,
      group.getReserveFund().getTransactions(),
      group.getCurrency()
    );
  }
}
