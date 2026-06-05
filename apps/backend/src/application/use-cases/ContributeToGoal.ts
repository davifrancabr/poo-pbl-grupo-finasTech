import { MemberId } from '@/domain/group/MemberId';
import { GoalId } from '@/domain/savings/GoalId';
import { Money } from '@/domain/shared/Money';
import type { GroupRepository } from '../ports/GroupRepository';
import type { SavingsGoalRepository } from '../ports/SavingsGoalRepository';

export class ContributeToGoal {
  constructor(
    private readonly groupRepo: GroupRepository,
    private readonly goalRepo: SavingsGoalRepository
  ) {}

  async execute(
    goalId: string,
    memberId: string,
    amount: number
  ): Promise<void> {
    const goal = await this.goalRepo.findById(GoalId.create(goalId));
    if (!goal) throw new Error('Meta não encontrada.');

    const group = await this.groupRepo.findById(goal.getGroupId());
    if (!group) throw new Error('Grupo não encontrado.');

    group.requiredMember(MemberId.create(memberId));
    goal.contribute(
      MemberId.create(memberId),
      Money.fromDecimal(amount, group.getCurrency())
    );
    await this.goalRepo.save(goal);
  }
}
