import { Group } from '@/domain/group/Group';
import { Currency } from '@/domain/shared/Currency';
import type { GroupRepository } from '../ports/GroupRepository';

export class CreateGroup {
  constructor(private readonly groupRepo: GroupRepository) {}

  async execute(name: string, currencyCode = 'BRL'): Promise<Group> {
    const group = Group.create(name, Currency.fromCode(currencyCode));

    await this.groupRepo.save(group);
    return group;
  }
}
