import type { GroupId } from '@/domain/group/GroupId';
import type { GoalId } from '@/domain/savings/GoalId';
import type { SavingsGoal } from '@/domain/savings/SavingsGoal';

export interface SavingsGoalRepository {
  save(goal: SavingsGoal): Promise<void>;
  findByGroupId(groupId: GroupId): Promise<SavingsGoal[]>;
  findById(id: GoalId): Promise<SavingsGoal | null>;
}
