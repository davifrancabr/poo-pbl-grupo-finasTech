import type { Group } from '../../domain/group/Group';
import type { GroupRepository } from '../ports/GroupRepository';

export class ListGroups {
  constructor(private readonly groupRepo: GroupRepository) {}

  async execute(): Promise<Group[]> {
    return this.groupRepo.findAll();
  }
}
