import type { SavingsGoalRepository } from '@/application/ports/SavingsGoalRepository';
import type { GroupId } from '@/domain/group/GroupId';
import type { GoalId } from '@/domain/savings/GoalId';
import type { SavingsGoal } from '@/domain/savings/SavingsGoal';

export class InMemorySavingsGoalRepository implements SavingsGoalRepository {
  private readonly store = new Map<string, SavingsGoal>();

  async save(goal: SavingsGoal): Promise<void> {
    this.store.set(goal.getId().getValue(), goal);
  }

  async findByGroupId(groupId: GroupId): Promise<SavingsGoal[]> {
    return [...this.store.values()].filter(
      g => g.getGroupId().getValue() === groupId.getValue()
    );
  }

  async findById(id: GoalId): Promise<SavingsGoal | null> {
    return this.store.get(id.getValue()) ?? null;
  }
}
