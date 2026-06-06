import { GroupId } from '../../domain/group/GroupId';
import { Member } from '../../domain/group/Member';
import type { GroupRepository } from '../ports/GroupRepository';

export class AddMemberToGroup {
  constructor(private readonly groupRepo: GroupRepository) {}

  async execute(groupId: string, name: string): Promise<Member> {
    const group = await this.groupRepo.findById(GroupId.create(groupId));
    if (!group) throw new Error('Grupo não encontrado.');

    const member = group.addMember(name);
    await this.groupRepo.save(group);

    return member;
  }
}
