import type { SavingsGoalRepository } from '@/application/ports/SavingsGoalRepository';
import type { GroupId } from '@/domain/group/GroupId';
import type { GoalId } from '@/domain/savings/GoalId';
import type { SavingsGoal } from '@/domain/savings/SavingsGoal';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { SavingsGoalMapper } from '../mappers/SavingsGoalMapper';
import { db } from './client';
import { goalContributions, groups, savingsGoals } from './schema';

export class DrizzleSavingsGoalRepository implements SavingsGoalRepository {
  async save(goal: SavingsGoal): Promise<void> {
    const id = goal.getId().getValue();
    const contributionRows = goal.getContributions().map(c => ({
      id: uuidv4(),
      goalId: id,
      memberId: c.memberId.getValue(),
      amount: c.amount.getAmount(),
      contributedAt: c.contributedAt
    }));

    await db.transaction(async tx => {
      await tx
        .insert(savingsGoals)
        .values({
          id,
          groupId: goal.getGroupId().getValue(),
          title: goal.getTitle(),
          targetAmount: goal.getTargetAmount().getAmount(),
          currentAmount: goal.getCurrentAmount().getAmount(),
          deadline: goal.getDeadline()
        })
        .onConflictDoUpdate({
          target: savingsGoals.id,
          set: {
            title: goal.getTitle(),
            currentAmount: goal.getCurrentAmount().getAmount(),
            deadline: goal.getDeadline()
          }
        });

      await tx
        .delete(goalContributions)
        .where(eq(goalContributions.goalId, id));

      if (contributionRows.length > 0)
        await tx.insert(goalContributions).values(contributionRows);
    });
  }

  async findByGroupId(groupId: GroupId): Promise<SavingsGoal[]> {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId.getValue()),
      columns: { currencyCode: true }
    });
    if (!group) return [];

    const rows = await db.query.savingsGoals.findMany({
      where: eq(savingsGoals.groupId, groupId.getValue()),
      with: { contributions: true }
    });

    return rows.map(r => SavingsGoalMapper.toDomain(r, group.currencyCode));
  }

  async findById(id: GoalId): Promise<SavingsGoal | null> {
    const row = await db.query.savingsGoals.findFirst({
      where: eq(savingsGoals.id, id.getValue()),
      with: { contributions: true, group: true }
    });

    return row ? SavingsGoalMapper.toDomain(row, row.group.currencyCode) : null;
  }
}
