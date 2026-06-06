import { GroupId } from '../../domain/group/GroupId';
import { MemberId } from '../../domain/group/MemberId';
import { Money } from '../../domain/shared/Money';
import type { GroupRepository } from '../ports/GroupRepository';

export class ContributeToReserve {
  constructor(private readonly groupRepo: GroupRepository) {}

  async execute(
    groupId: string,
    memberId: string,
    amount: string,
    description: string
  ): Promise<void> {
    const group = await this.groupRepo.findById(GroupId.create(groupId));
    if (!group) throw new Error('Grupo não encontrado.');

    const money = Money.fromDecimal(amount, group.getCurrency());
    group.contributeToReserve(MemberId.create(memberId), money, description);

    await this.groupRepo.save(group);
  }
}
