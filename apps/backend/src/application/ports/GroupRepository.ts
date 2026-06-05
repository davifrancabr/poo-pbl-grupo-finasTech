import type { Group } from '@/domain/group/Group';
import type { GroupId } from '@/domain/group/GroupId';

export interface GroupRepository {
  save(group: Group): Promise<void>;
  findById(id: GroupId): Promise<Group | null>;
  findAll(): Promise<Group[]>;
}
