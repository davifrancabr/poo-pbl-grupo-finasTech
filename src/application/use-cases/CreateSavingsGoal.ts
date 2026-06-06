import { GroupId } from '../../domain/group/GroupId';
import { SavingsGoal } from '../../domain/savings/SavingsGoal';
import { Money } from '../../domain/shared/Money';
import type { GroupRepository } from '../ports/GroupRepository';
import type { SavingsGoalRepository } from '../ports/SavingsGoalRepository';

export class CreateSavingsGoal {
  constructor(
    private readonly groupRepo: GroupRepository,
    private readonly goalRepo: SavingsGoalRepository
  ) {}

  async execute(
    groupId: string,
    title: string,
    targetAmount: string,
    deadline?: Date
  ): Promise<SavingsGoal> {
    const group = await this.groupRepo.findById(GroupId.create(groupId));
    if (!group) throw new Error('Grupo não encontrado.');

    const goal = SavingsGoal.create(
      group.getId(),
      title,
      Money.fromDecimal(targetAmount, group.getCurrency()),
      deadline ? new Date(deadline) : undefined
    );

    await this.goalRepo.save(goal);
    return goal;
  }
}
