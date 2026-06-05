import { Expense } from '@/domain/expenses/Expense';
import { ExpenseSplitCalculator } from '@/domain/expenses/ExpenseSplitCalculator';
import {
  EqualSplitStrategy,
  FixedAmountSplitStrategy,
  PercentageSplitStrategy
} from '@/domain/expenses/SplitStrategy';
import { GroupId } from '@/domain/group/GroupId';
import { MemberId } from '@/domain/group/MemberId';
import { Money } from '@/domain/shared/Money';
import type { ExpenseRepository } from '../ports/ExpenseRepository';
import type { GroupRepository } from '../ports/GroupRepository';

export type SplitType = 'equal' | 'percentage' | 'fixed';

export interface RecordExpenseInput {
  groupId: string;
  payerId: string;
  amount: number;
  description: string;
  splitType: SplitType;
  participantsIds: string[];
  percentages?: Record<string, number>;
  fixedAmounts?: Record<string, number>;
}

export class RecordExpense {
  private readonly calculator = new ExpenseSplitCalculator();

  constructor(
    private readonly groupRepo: GroupRepository,
    private readonly expenseRepo: ExpenseRepository
  ) {}

  async execute(input: RecordExpenseInput): Promise<Expense> {
    const group = await this.groupRepo.findById(GroupId.create(input.groupId));
    if (!group) throw new Error('Grupo não encontrado.');

    const payerId = MemberId.create(input.payerId);
    group.requiredMember(payerId);

    const currency = group.getCurrency();
    const total = Money.fromDecimal(input.amount, currency);
    const participants = input.participantsIds.map(id => {
      const memberId = MemberId.create(id);
      group.requiredMember(memberId);

      return memberId;
    });

    let strategy;
    switch (input.splitType) {
      case 'equal':
        strategy = new EqualSplitStrategy();
        break;
      case 'percentage': {
        const map = new Map<string, number>();
        for (const [k, v] of Object.entries(input.percentages ?? {})) {
          map.set(k, v);
        }
        strategy = new PercentageSplitStrategy(map);
        break;
      }
      case 'fixed': {
        const map = new Map<string, Money>();
        for (const [k, v] of Object.entries(input.fixedAmounts ?? {})) {
          map.set(k, Money.fromDecimal(v, currency));
        }
        strategy = new FixedAmountSplitStrategy(map);
        break;
      }
    }

    const splits = this.calculator.calculate(total, participants, strategy);
    const expense = Expense.create(
      group.getId(),
      payerId,
      total,
      splits,
      input.description
    );

    await this.expenseRepo.save(expense);
    return expense;
  }
}
