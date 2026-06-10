import type { GroupRepository } from '@/application/ports/GroupRepository.ts';
import type { Group } from '@/domain/group/Group';
import type { GroupId } from '@/domain/group/GroupId';

export class InMemoryGroupRepository implements GroupRepository {
  private readonly store = new Map<string, Group>();

  async save(group: Group): Promise<void> {
    this.store.set(group.getId().getValue(), group);
  }

  async findById(id: GroupId): Promise<Group | null> {
    return this.store.get(id.getValue()) ?? null;
  }

  async findAll(): Promise<Group[]> {
    return [...this.store.values()];
  }
}
