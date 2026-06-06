import { Expense } from '@/domain/expenses/Expense';
import { ExpenseId } from '@/domain/expenses/ExpenseId';
import { SplitAllocation } from '@/domain/expenses/SplitAllocation';
import { GroupId } from '@/domain/group/GroupId';
import { MemberId } from '@/domain/group/MemberId';
import { Currency } from '@/domain/shared/Currency';
import { Money } from '@/domain/shared/Money';
import type { InferSelectModel } from 'drizzle-orm';
import { expenses, expenseSplits } from '../drizzle/schema';

type ExpenseRow = InferSelectModel<typeof expenses>;
type ExpenseWithSplits = ExpenseRow & {
  splits: InferSelectModel<typeof expenseSplits>[];
};

export class ExpenseMapper {
  static toDomain(row: ExpenseWithSplits, currencyCode: string): Expense {
    const currency = Currency.fromCode(currencyCode);
    const splits = row.splits.map(s =>
      SplitAllocation.create(
        MemberId.create(s.memberId),
        Money.fromMinorUnit(s.shareAmount, currency)
      )
    );

    return Expense.reconstitute(
      ExpenseId.create(row.id),
      GroupId.create(row.groupId),
      MemberId.create(row.payerId),
      Money.fromMinorUnit(row.totalAmount, currency),
      splits,
      row.description,
      row.occurredAt
    );
  }
}
