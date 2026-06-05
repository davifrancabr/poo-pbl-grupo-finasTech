import { GroupId } from '@/domain/group/GroupId';
import { MemberId } from '@/domain/group/MemberId';
import { GoalId } from '@/domain/savings/GoalId';
import { SavingsGoal } from '@/domain/savings/SavingsGoal';
import { Currency } from '@/domain/shared/Currency';
import { Money } from '@/domain/shared/Money';
import type { InferSelectModel } from 'drizzle-orm';
import type { goalContributions, savingsGoals } from '../drizzle/schema';

type SavingsGoalRow = InferSelectModel<typeof savingsGoals>;
type GoalWithContributions = SavingsGoalRow & {
  contributions: InferSelectModel<typeof goalContributions>[];
};

export class SavingsGoalMapper {
  static toDomain(
    row: GoalWithContributions,
    currencyCode: string
  ): SavingsGoal {
    const currency = Currency.fromCode(currencyCode);
    const contributions = row.contributions.map(c => ({
      memberId: MemberId.create(c.memberId),
      amount: Money.fromMinorUnit(c.amount, currency),
      contributedAt: c.contributedAt
    }));

    return SavingsGoal.reconstitute(
      GoalId.create(row.id),
      GroupId.create(row.groupId),
      row.title,
      Money.fromMinorUnit(row.targetAmount, currency),
      Money.fromMinorUnit(row.currentAmount, currency),
      row.deadline,
      contributions
    );
  }
}
